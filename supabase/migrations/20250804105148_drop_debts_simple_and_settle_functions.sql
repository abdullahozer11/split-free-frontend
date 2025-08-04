drop policy "all" on "public"."debts_simple";

drop policy "insert" on "public"."debts_simple";

drop policy "update" on "public"."debts_simple";

revoke delete on table "public"."debts_simple" from "anon";

revoke insert on table "public"."debts_simple" from "anon";

revoke references on table "public"."debts_simple" from "anon";

revoke select on table "public"."debts_simple" from "anon";

revoke trigger on table "public"."debts_simple" from "anon";

revoke truncate on table "public"."debts_simple" from "anon";

revoke update on table "public"."debts_simple" from "anon";

revoke delete on table "public"."debts_simple" from "authenticated";

revoke insert on table "public"."debts_simple" from "authenticated";

revoke references on table "public"."debts_simple" from "authenticated";

revoke select on table "public"."debts_simple" from "authenticated";

revoke trigger on table "public"."debts_simple" from "authenticated";

revoke truncate on table "public"."debts_simple" from "authenticated";

revoke update on table "public"."debts_simple" from "authenticated";

revoke delete on table "public"."debts_simple" from "service_role";

revoke insert on table "public"."debts_simple" from "service_role";

revoke references on table "public"."debts_simple" from "service_role";

revoke select on table "public"."debts_simple" from "service_role";

revoke trigger on table "public"."debts_simple" from "service_role";

revoke truncate on table "public"."debts_simple" from "service_role";

revoke update on table "public"."debts_simple" from "service_role";

alter table "public"."debts_simple" drop constraint "public_debts_simple_borrower_fkey";

alter table "public"."debts_simple" drop constraint "public_debts_simple_group_id_fkey";

alter table "public"."debts_simple" drop constraint "public_debts_simple_lender_fkey";

drop function if exists "public"."settle_expense2"(expense_id bigint, _group_id bigint);

drop function if exists "public"."settle_group2"(_id bigint);

alter table "public"."debts_simple" drop constraint "debts_simple_pkey";

drop index if exists "public"."debts_simple_pkey";

drop table "public"."debts_simple";


