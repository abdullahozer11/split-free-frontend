drop policy "public can fetch" on "public"."expense_categories";

revoke delete on table "public"."expense_categories" from "anon";

revoke insert on table "public"."expense_categories" from "anon";

revoke references on table "public"."expense_categories" from "anon";

revoke select on table "public"."expense_categories" from "anon";

revoke trigger on table "public"."expense_categories" from "anon";

revoke truncate on table "public"."expense_categories" from "anon";

revoke update on table "public"."expense_categories" from "anon";

revoke delete on table "public"."expense_categories" from "authenticated";

revoke insert on table "public"."expense_categories" from "authenticated";

revoke references on table "public"."expense_categories" from "authenticated";

revoke select on table "public"."expense_categories" from "authenticated";

revoke trigger on table "public"."expense_categories" from "authenticated";

revoke truncate on table "public"."expense_categories" from "authenticated";

revoke update on table "public"."expense_categories" from "authenticated";

revoke delete on table "public"."expense_categories" from "service_role";

revoke insert on table "public"."expense_categories" from "service_role";

revoke references on table "public"."expense_categories" from "service_role";

revoke select on table "public"."expense_categories" from "service_role";

revoke trigger on table "public"."expense_categories" from "service_role";

revoke truncate on table "public"."expense_categories" from "service_role";

revoke update on table "public"."expense_categories" from "service_role";

drop function if exists "public"."get_category_with_embedding"(query_embedding vector);

alter table "public"."expense_categories" drop constraint "expense_categories_pkey";

drop index if exists "public"."expense_categories_pkey";

drop table "public"."expense_categories";

alter table "public"."expenses" alter column "category" set default 'Shopping'::text;

alter table "public"."expenses" alter column "category" drop not null;


