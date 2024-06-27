set check_function_bodies = off;

CREATE OR REPLACE FUNCTION algo.post_expense(group_id_input bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  perform algo.recalculate_total_balance(group_id_input);
  perform algo.recalculate_total_expense(group_id_input);
  perform algo.calculate_new_debts(group_id_input);
  perform algo.update_profile_balance(group_id_input);
  perform algo.update_group_settled_status(group_id_input);
end;
$function$
;


drop policy "users can add expenses in their groups" on "public"."expenses";

create table "public"."debts_for_expense" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "amount" bigint not null,
    "lender" bigint not null,
    "borrower" bigint not null,
    "currency" text not null,
    "group_id" bigint not null,
    "expense_id" bigint not null
);


alter table "public"."debts_for_expense" enable row level security;

alter table "public"."profiles" add column "currency" text not null default 'euro'::text;

CREATE UNIQUE INDEX debts_for_expense_pkey ON public.debts_for_expense USING btree (id);

alter table "public"."debts_for_expense" add constraint "debts_for_expense_pkey" PRIMARY KEY using index "debts_for_expense_pkey";

alter table "public"."debts_for_expense" add constraint "debts_for_expense_borrower_fkey" FOREIGN KEY (borrower) REFERENCES members(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."debts_for_expense" validate constraint "debts_for_expense_borrower_fkey";

alter table "public"."debts_for_expense" add constraint "debts_for_expense_expense_id_fkey" FOREIGN KEY (expense_id) REFERENCES expenses(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."debts_for_expense" validate constraint "debts_for_expense_expense_id_fkey";

alter table "public"."debts_for_expense" add constraint "debts_for_expense_group_id_fkey" FOREIGN KEY (group_id) REFERENCES groups(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."debts_for_expense" validate constraint "debts_for_expense_group_id_fkey";

alter table "public"."debts_for_expense" add constraint "debts_for_expense_lender_fkey" FOREIGN KEY (lender) REFERENCES members(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."debts_for_expense" validate constraint "debts_for_expense_lender_fkey";

alter table "public"."profiles" add constraint "profiles_currency_check" CHECK ((length(currency) < 12)) not valid;

alter table "public"."profiles" validate constraint "profiles_currency_check";

grant delete on table "public"."debts_for_expense" to "anon";

grant insert on table "public"."debts_for_expense" to "anon";

grant references on table "public"."debts_for_expense" to "anon";

grant select on table "public"."debts_for_expense" to "anon";

grant trigger on table "public"."debts_for_expense" to "anon";

grant truncate on table "public"."debts_for_expense" to "anon";

grant update on table "public"."debts_for_expense" to "anon";

grant delete on table "public"."debts_for_expense" to "authenticated";

grant insert on table "public"."debts_for_expense" to "authenticated";

grant references on table "public"."debts_for_expense" to "authenticated";

grant select on table "public"."debts_for_expense" to "authenticated";

grant trigger on table "public"."debts_for_expense" to "authenticated";

grant truncate on table "public"."debts_for_expense" to "authenticated";

grant update on table "public"."debts_for_expense" to "authenticated";

grant delete on table "public"."debts_for_expense" to "service_role";

grant insert on table "public"."debts_for_expense" to "service_role";

grant references on table "public"."debts_for_expense" to "service_role";

grant select on table "public"."debts_for_expense" to "service_role";

grant trigger on table "public"."debts_for_expense" to "service_role";

grant truncate on table "public"."debts_for_expense" to "service_role";

grant update on table "public"."debts_for_expense" to "service_role";

create policy "users can access the debts from their groups"
on "public"."debts_for_expense"
as permissive
for all
to anon, authenticated
using (utils.is_member_of(auth.uid(), group_id));



