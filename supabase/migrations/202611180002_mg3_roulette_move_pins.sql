create or replace function public.mg3_roulette_admin_action(p_action text, p_payload jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_state public.mg3_roulette_state%rowtype;
  next_players jsonb;
  next_assignments jsonb;
  available_players text[];
  available_islands text[];
  selected_player text;
  selected_island text;
  selected_region text;
  selected_index integer;
  selected_rotation numeric;
  current_counts jsonb;
  requested_name text;
  move_x numeric;
  move_y numeric;
begin
  select * into current_state from public.mg3_roulette_state where id = true for update;
  if not found then raise exception 'Estado da roleta não inicializado.'; end if;

  next_players := current_state.players;
  next_assignments := current_state.assignments;

  if p_action = 'add_players' then
    if jsonb_typeof(p_payload->'players') <> 'array' then raise exception 'Lista de jogadores inválida.'; end if;
    for requested_name in select trim(value #>> '{}') from jsonb_array_elements(p_payload->'players') value loop
      if length(requested_name) > 0 and length(requested_name) <= 32
        and not exists (select 1 from jsonb_array_elements_text(next_players) p where lower(p) = lower(requested_name)) then
        next_players := next_players || jsonb_build_array(requested_name);
      end if;
    end loop;
  elsif p_action = 'remove_player' then
    requested_name := trim(p_payload->>'player');
    if exists (select 1 from jsonb_array_elements(next_assignments) a where a->>'player' = requested_name) then
      raise exception 'Não é possível remover um jogador já sorteado.';
    end if;
    select coalesce(jsonb_agg(p), '[]'::jsonb) into next_players
    from jsonb_array_elements_text(next_players) p where p <> requested_name;
  elsif p_action = 'move_pin' then
    requested_name := trim(p_payload->>'player');
    if jsonb_typeof(p_payload->'x') is distinct from 'number'
      or jsonb_typeof(p_payload->'y') is distinct from 'number' then
      raise exception 'Posição do pino inválida.';
    end if;
    move_x := (p_payload->>'x')::numeric;
    move_y := (p_payload->>'y')::numeric;
    if move_x < 1 or move_x > 99 or move_y < 1 or move_y > 99 then
      raise exception 'Posição do pino fora do mapa.';
    end if;
    if not exists (select 1 from jsonb_array_elements(next_assignments) a where a->>'player' = requested_name) then
      raise exception 'Jogador não encontrado na distribuição.';
    end if;
    select jsonb_agg(
      case when entry.value->>'player' = requested_name
        then entry.value || jsonb_build_object('x', move_x, 'y', move_y)
        else entry.value end
      order by entry.ordinality
    ) into next_assignments
    from jsonb_array_elements(next_assignments) with ordinality as entry(value, ordinality);
  elsif p_action = 'spin' then
    if current_state.lock_until > now() then raise exception 'A roleta ainda está girando.'; end if;
    select array_agg(p) into available_players
    from jsonb_array_elements_text(next_players) p
    where not exists (select 1 from jsonb_array_elements(next_assignments) a where a->>'player' = p);

    select coalesce(jsonb_object_agg(i, n), '{}'::jsonb) into current_counts
    from (
      select a->>'island' as i, count(*) as n
      from jsonb_array_elements(next_assignments) a group by a->>'island'
    ) counts;
    select array_agg(i order by ord) into available_islands
    from unnest(array['Ruína dos Cristais','Maçã Radiativa','Ilha dos Segredos','Camocim','Triatlo Infernal','Prepúcio Ártico','Cordilheira Rachada']) with ordinality as items(i, ord)
    where coalesce((current_counts->>i)::integer, 0) < 5;
    if coalesce(array_length(available_players, 1), 0) = 0 then raise exception 'Todos os jogadores já foram distribuídos.'; end if;
    if coalesce(array_length(available_islands, 1), 0) = 0 then raise exception 'Todas as ilhas atingiram o limite de 5 jogadores.'; end if;

    selected_player := available_players[1 + floor(random() * array_length(available_players, 1))::integer];
    selected_island := available_islands[1 + floor(random() * array_length(available_islands, 1))::integer];
    selected_region := case selected_island
      when 'Prepúcio Ártico' then 'prepucio-artico'
      when 'Cordilheira Rachada' then 'cordilheira-rachada'
      when 'Triatlo Infernal' then 'triatlo-infernal'
      when 'Ruína dos Cristais' then 'ruina-dos-cristais'
      when 'Ilha dos Segredos' then 'ilha-dos-segredos'
      when 'Camocim' then 'camocim'
      when 'Maçã Radiativa' then 'maca-radiativa'
    end;
    selected_index := array_position(available_islands, selected_island) - 1;
    selected_rotation := floor(current_state.rotation / 360) * 360 + 2160 + (360 - ((selected_index + 0.5) * 360 / array_length(available_islands, 1)));
    next_assignments := next_assignments || jsonb_build_array(jsonb_build_object(
      'player', selected_player,
      'island', selected_island,
      'regionId', selected_region,
      'colorIndex', jsonb_array_length(next_assignments)
    ));
    update public.mg3_roulette_state set
      players = next_players,
      assignments = next_assignments,
      rotation = selected_rotation,
      last_spin = jsonb_build_object(
        'id', gen_random_uuid(), 'player', selected_player, 'island', selected_island,
        'regionId', selected_region, 'rotation', selected_rotation,
        'wheelIslands', to_jsonb(available_islands), 'startedAt', now()
      ),
      lock_until = now() + interval '5 seconds', updated_at = now()
    where id = true returning * into current_state;
    return to_jsonb(current_state);
  elsif p_action = 'reset' then
    next_assignments := '[]'::jsonb;
  else
    raise exception 'Ação administrativa desconhecida.';
  end if;

  update public.mg3_roulette_state set
    players = next_players,
    assignments = next_assignments,
    rotation = case when p_action = 'reset' then 0 else rotation end,
    last_spin = case when p_action = 'reset' then null else last_spin end,
    lock_until = null,
    updated_at = now()
  where id = true returning * into current_state;
  return to_jsonb(current_state);
end;
$$;
