--
-- PostgreSQL database dump
--

\restrict ClP4d3ZhuWOv62LkANhW9rWRHQ38xEsDY1P8pI1UtexXbWVXz3aiREbmyhcWNLt

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg13+1)
-- Dumped by pg_dump version 18.4 (Homebrew)

-- Started on 2026-06-03 16:18:12 IST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 24577)
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- TOC entry 4303 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16389)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16946)
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    id text NOT NULL,
    name text NOT NULL,
    destination_id text NOT NULL,
    price_per_person numeric(10,2) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    deleted_at timestamp(3) without time zone,
    photo_url text
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16645)
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id text NOT NULL,
    user_id text,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    old_value jsonb,
    new_value jsonb,
    ip_address text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16871)
-- Name: b2b_agents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.b2b_agents (
    id text NOT NULL,
    company_name text NOT NULL,
    gst_number text,
    mobile text NOT NULL,
    mobile2 text,
    email text,
    email2 text,
    city text,
    address text,
    dob date,
    anniversary date,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.b2b_agents OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 17133)
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_posts (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    body_html text NOT NULL,
    excerpt text,
    cover_image text,
    author text,
    tags text,
    seo_title text,
    seo_desc text,
    is_published boolean DEFAULT false NOT NULL,
    published_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.blog_posts OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 17305)
-- Name: booking_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_services (
    id text NOT NULL,
    query_id text NOT NULL,
    proposal_day_id text,
    service_type text NOT NULL,
    service_name text NOT NULL,
    supplier_id text,
    supplier_name text,
    supplier_email text,
    check_in date,
    check_out date,
    service_date date,
    rate_per_unit numeric(12,2) DEFAULT 0 NOT NULL,
    units integer DEFAULT 1 NOT NULL,
    total_cost numeric(12,2) DEFAULT 0 NOT NULL,
    supplier_amount_paid numeric(12,2) DEFAULT 0 NOT NULL,
    supplier_amount_pending numeric(12,2) DEFAULT 0 NOT NULL,
    mail_status text DEFAULT 'not_sent'::text NOT NULL,
    mail_sent_at timestamp(3) without time zone,
    payment_status text DEFAULT 'pending'::text NOT NULL,
    confirmation_number text,
    notes text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.booking_services OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 17251)
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id text NOT NULL,
    name text NOT NULL,
    city text,
    address text,
    phone text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16856)
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    whatsapp text,
    mobile2 text,
    address text,
    city text,
    date_of_birth date,
    anniversary date,
    passport_number text,
    passport_expiry date,
    lifetime_spend numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 17077)
-- Name: cms_pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cms_pages (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    body_html text NOT NULL,
    seo_title text,
    seo_desc text,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cms_pages OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 17007)
-- Name: day_itinerary_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.day_itinerary_templates (
    id text NOT NULL,
    title text NOT NULL,
    destination_id text NOT NULL,
    description text,
    deleted_at timestamp(3) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    photo_url text
);


ALTER TABLE public.day_itinerary_templates OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 17149)
-- Name: destination_cms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destination_cms (
    id text NOT NULL,
    destination_id text NOT NULL,
    about_html text,
    hero_image text,
    gallery_images jsonb,
    seo_title text,
    seo_desc text,
    is_published boolean DEFAULT false NOT NULL
);


ALTER TABLE public.destination_cms OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16526)
-- Name: destinations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destinations (
    id text NOT NULL,
    name text NOT NULL,
    country text,
    description text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.destinations OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 17046)
-- Name: email_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_logs (
    id text NOT NULL,
    query_id text NOT NULL,
    template_id text,
    subject text NOT NULL,
    body text NOT NULL,
    sent_by text,
    sent_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'sent'::text NOT NULL,
    communication_type text DEFAULT 'customer'::text NOT NULL,
    cc text,
    error_msg text,
    "to" text
);


ALTER TABLE public.email_logs OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16886)
-- Name: email_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_templates (
    id text NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    body_rich_text text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.email_templates OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 17177)
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id text NOT NULL,
    amount numeric(12,2) NOT NULL,
    category text NOT NULL,
    vendor text,
    description text,
    expense_date date NOT NULL,
    receipt_url text,
    recorded_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 17120)
-- Name: gallery_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gallery_images (
    id text NOT NULL,
    image_url text NOT NULL,
    caption text,
    category text,
    sequence integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.gallery_images OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 17093)
-- Name: home_banners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.home_banners (
    id text NOT NULL,
    image_url text NOT NULL,
    title text,
    subtitle text,
    link_url text,
    sequence integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.home_banners OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16537)
-- Name: hotels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hotels (
    id text NOT NULL,
    destination_id text NOT NULL,
    name text NOT NULL,
    category text,
    base_price numeric(10,2),
    is_active boolean DEFAULT true NOT NULL,
    image_url text
);


ALTER TABLE public.hotels OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16658)
-- Name: integration_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integration_logs (
    id text NOT NULL,
    type text NOT NULL,
    direction text NOT NULL,
    status text NOT NULL,
    payload jsonb,
    error_message text,
    related_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.integration_logs OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 17192)
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    invoice_number text NOT NULL,
    query_id text,
    tour_id text,
    client_name text NOT NULL,
    client_email text,
    client_phone text,
    client_address text,
    items jsonb NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    tax_percent numeric(5,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    pdf_url text,
    status text DEFAULT 'draft'::text NOT NULL,
    sent_at timestamp(3) without time zone,
    paid_at timestamp(3) without time zone,
    due_date date,
    notes text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 25818)
-- Name: itineraries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itineraries (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    cover_photo_url text,
    share_slug text,
    status text DEFAULT 'draft'::text NOT NULL,
    total_cost numeric(12,2),
    per_person_cost numeric(12,2),
    currency text DEFAULT 'INR'::text NOT NULL,
    adults integer DEFAULT 2 NOT NULL,
    children integer DEFAULT 0 NOT NULL,
    markup_pct numeric(5,2),
    created_by text NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    terms_html text,
    cancellation_policy_html text,
    exclusions_html text,
    inclusions_html text,
    payment_policy_html text,
    nights integer,
    costing_breakdown jsonb,
    selling_price numeric(12,2),
    is_template boolean DEFAULT false NOT NULL,
    source_template_id text,
    travel_date_from date,
    travel_date_to date
);


ALTER TABLE public.itineraries OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 25839)
-- Name: itinerary_days; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itinerary_days (
    id text NOT NULL,
    itinerary_id text NOT NULL,
    day_number integer NOT NULL,
    title text,
    destination_id text,
    description text,
    image_url text
);


ALTER TABLE public.itinerary_days OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 25849)
-- Name: itinerary_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itinerary_events (
    id text NOT NULL,
    day_id text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    description text,
    start_time text,
    end_time text,
    cost numeric(10,2),
    image_url text,
    metadata jsonb,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.itinerary_events OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 25862)
-- Name: itinerary_gallery_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itinerary_gallery_images (
    id text NOT NULL,
    itinerary_id text NOT NULL,
    image_url text NOT NULL,
    caption text,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.itinerary_gallery_images OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 16983)
-- Name: meal_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meal_plans (
    id text NOT NULL,
    name text NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.meal_plans OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16626)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    message text NOT NULL,
    channel text DEFAULT 'in_app'::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    related_type text,
    related_id text,
    is_read boolean DEFAULT false NOT NULL,
    sent_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16923)
-- Name: org_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org_settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.org_settings OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 17160)
-- Name: package_terms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.package_terms (
    id text NOT NULL,
    name text NOT NULL,
    body_html text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.package_terms OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16996)
-- Name: package_themes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.package_themes (
    id text NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    deleted_at timestamp(3) without time zone,
    icon_url text
);


ALTER TABLE public.package_themes OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16609)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    tour_id text,
    query_id text,
    amount numeric(12,2) NOT NULL,
    mode text NOT NULL,
    reference_utr text,
    payment_date date NOT NULL,
    recorded_by text,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    idempotency_key text,
    deleted_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16417)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    key text NOT NULL,
    label text NOT NULL,
    module text NOT NULL,
    description text
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16566)
-- Name: proposal_days; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_days (
    id text NOT NULL,
    proposal_id text NOT NULL,
    day_number integer NOT NULL,
    destination_id text,
    hotel_id text,
    activities text,
    meals_included text,
    transport text,
    day_cost numeric(10,2),
    description text
);


ALTER TABLE public.proposal_days OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16549)
-- Name: proposals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposals (
    id text NOT NULL,
    query_id text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    total_cost numeric(12,2),
    markup_pct numeric(5,2),
    selling_price numeric(12,2),
    pdf_url text,
    pdf_status text DEFAULT 'none'::text NOT NULL,
    sent_at timestamp(3) without time zone,
    last_sent_at timestamp(3) without time zone,
    created_by text NOT NULL,
    deleted_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    itinerary_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    travel_date_from date,
    travel_date_to date
);


ALTER TABLE public.proposals OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16490)
-- Name: queries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queries (
    id text NOT NULL,
    query_code text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    destination text,
    travel_date_from date,
    travel_date_to date,
    adults integer DEFAULT 1 NOT NULL,
    children integer DEFAULT 0 NOT NULL,
    budget numeric(12,2),
    lead_source text NOT NULL,
    campaign_name text,
    status text DEFAULT 'new'::text NOT NULL,
    assigned_to text,
    next_followup_at timestamp(3) without time zone,
    merged_into text,
    deleted_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    b2b_agent_id text,
    client_id text
);


ALTER TABLE public.queries OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 17350)
-- Name: query_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.query_documents (
    id text NOT NULL,
    query_id text NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    uploaded_by text NOT NULL,
    label text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.query_documents OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16513)
-- Name: query_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.query_notes (
    id text NOT NULL,
    query_id text NOT NULL,
    user_id text NOT NULL,
    note text NOT NULL,
    follow_up_at timestamp(3) without time zone,
    deleted_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    note_type text DEFAULT 'note'::text NOT NULL
);


ALTER TABLE public.query_notes OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16901)
-- Name: query_status_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.query_status_settings (
    id text NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    color_hex text DEFAULT '#6B7280'::text NOT NULL,
    is_dashboard_visible boolean DEFAULT true NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    take_note_flag boolean DEFAULT false NOT NULL,
    sequence integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.query_status_settings OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16428)
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    role_id text NOT NULL,
    permission_id text NOT NULL,
    granted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16403)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    label text NOT NULL,
    description text,
    "isSystem" boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 16972)
-- Name: room_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_types (
    id text NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.room_types OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 17230)
-- Name: sheet_sync_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sheet_sync_configs (
    id text NOT NULL,
    name text NOT NULL,
    sheet_url text NOT NULL,
    sheet_id text NOT NULL,
    tab_name text DEFAULT 'Sheet1'::text NOT NULL,
    column_mapping jsonb NOT NULL,
    last_sync_at timestamp(3) without time zone,
    sync_interval integer DEFAULT 60 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sheet_sync_configs OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16934)
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id text NOT NULL,
    contact_person text,
    email text,
    phone text,
    city text,
    address text,
    is_active boolean DEFAULT true NOT NULL,
    deleted_at timestamp(3) without time zone,
    category text,
    company_name text
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 17106)
-- Name: testimonials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.testimonials (
    id text NOT NULL,
    customer_name text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    text text NOT NULL,
    photo_url text,
    destination text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.testimonials OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16593)
-- Name: tour_cancellations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_cancellations (
    id text NOT NULL,
    tour_id text NOT NULL,
    reason text NOT NULL,
    refund_amount numeric(12,2),
    status text DEFAULT 'pending'::text NOT NULL,
    requested_by text NOT NULL,
    processed_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tour_cancellations OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16576)
-- Name: tours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tours (
    id text NOT NULL,
    query_id text NOT NULL,
    proposal_id text,
    tour_code text NOT NULL,
    status text DEFAULT 'upcoming'::text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_pax integer,
    ops_notes text,
    assigned_ops text,
    deleted_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tours OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16959)
-- Name: transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transfers (
    id text NOT NULL,
    vehicle_type text NOT NULL,
    destination_id text NOT NULL,
    price numeric(10,2),
    description text,
    is_active boolean DEFAULT true NOT NULL,
    deleted_at timestamp(3) without time zone,
    photo_url text
);


ALTER TABLE public.transfers OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 41592)
-- Name: trending_destinations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trending_destinations (
    id text NOT NULL,
    region text NOT NULL,
    title text NOT NULL,
    tagline text NOT NULL,
    image text NOT NULL,
    link text NOT NULL,
    last_updated text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sequence integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.trending_destinations OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16440)
-- Name: user_permission_overrides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_permission_overrides (
    id text NOT NULL,
    user_id text NOT NULL,
    permission_id text NOT NULL,
    granted boolean NOT NULL,
    reason text,
    set_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_permission_overrides OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16477)
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id text NOT NULL,
    user_id text NOT NULL,
    refresh_token_hash text NOT NULL,
    device_info text,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16454)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role_id text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    mobile_only boolean DEFAULT false NOT NULL,
    is_on_leave boolean DEFAULT false NOT NULL,
    leave_until timestamp(3) without time zone,
    max_leads integer DEFAULT 50 NOT NULL,
    last_assigned_at timestamp(3) without time zone,
    created_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    department text,
    mobile text,
    mobile2 text,
    profile_photo text,
    branch_id text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 17215)
-- Name: vendor_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_payments (
    id text NOT NULL,
    supplier_id text,
    vendor_name text NOT NULL,
    amount numeric(12,2) NOT NULL,
    mode text NOT NULL,
    reference_id text,
    payment_date date NOT NULL,
    tour_id text,
    notes text,
    recorded_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone,
    updated_at timestamp(3) without time zone NOT NULL,
    query_id text
);


ALTER TABLE public.vendor_payments OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 17334)
-- Name: vouchers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vouchers (
    id text NOT NULL,
    query_id text NOT NULL,
    booking_service_id text,
    voucher_type text NOT NULL,
    voucher_number text NOT NULL,
    confirmation_number text,
    supplier_name text,
    hotel_name text,
    destination text,
    lead_pax_name text,
    pax_details text,
    check_in date,
    check_out date,
    room_type text,
    meal_plan text,
    greeting_message text,
    pdf_url text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.vouchers OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 41579)
-- Name: website_journey_days; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.website_journey_days (
    id text NOT NULL,
    journey_id text NOT NULL,
    day_number integer NOT NULL,
    title text NOT NULL,
    date text NOT NULL,
    "time" text NOT NULL,
    description text,
    image text
);


ALTER TABLE public.website_journey_days OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 41545)
-- Name: website_journeys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.website_journeys (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    regions text NOT NULL,
    duration_nights integer NOT NULL,
    duration_days integer NOT NULL,
    price_per_guest integer NOT NULL,
    original_price integer NOT NULL,
    departure_port text NOT NULL,
    return_port text NOT NULL,
    departure_date text NOT NULL,
    return_date text NOT NULL,
    ports integer DEFAULT 2 NOT NULL,
    countries integer DEFAULT 1 NOT NULL,
    vehicle text DEFAULT 'Premium SUV'::text NOT NULL,
    badges jsonb NOT NULL,
    images jsonb NOT NULL,
    map_image text,
    overview text,
    is_active boolean DEFAULT true NOT NULL,
    sequence integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.website_journeys OWNER TO postgres;

--
-- TOC entry 4244 (class 0 OID 16389)
-- Dependencies: 220
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
12310d06-3b56-4bff-8e0a-b14a14bbad86	e1a5711b11d24517498f76bc06f0b08e27b56c81b5d2fa2ea0dbc9665bcf191c	2026-03-19 23:50:51.113852+00	0_init	\N	\N	2026-03-19 23:50:51.043806+00	1
ef1649d5-f787-4712-b026-d07414a3938e	e69c9f21be2b53770b13ea52bf6c4f304a9fc86b41f1e932729ec2de45574341	2026-03-21 15:02:08.943067+00	20260321_sprint8	\N	\N	2026-03-21 15:02:08.918915+00	1
64972bdb-dec8-40ac-a67f-5922664d456b	0fb1b37f2071068da20ec390c24cc125d9891a1c4e330fad4b08f75f98159cf6	2026-03-21 15:56:43.003469+00	20260321_sprint10	\N	\N	2026-03-21 15:56:42.965066+00	1
d1d22c2f-d4da-49eb-ba9f-686aec0a1916	3b955a7fcf9fa65430ff45ecb57eea0fa9b9a0df52a95a2213e36e3c311c98fb	2026-03-22 15:05:59.186281+00	20260322_add_proposal_day_desc	\N	\N	2026-03-22 15:05:59.168371+00	1
041e0a29-c9d9-43b6-9eaa-0d4c012dba10	5600d31cc7ba6de93dd030720e520a7df83224cfe2fa92dfa2bd7a0e1f66f74e	2026-04-23 11:17:26.054233+00	20260409_fix_proposal_cascade	\N	\N	2026-04-23 11:17:25.335285+00	1
735478ee-4799-4591-a1ce-727d3e4407c3	e72827264345df27f4378f4f5d924148324ff8c3a418a8fc6a3cd477fe37f971	2026-04-23 11:17:27.034478+00	20260423_website_content	\N	\N	2026-04-23 11:17:26.357435+00	1
\.


--
-- TOC entry 4269 (class 0 OID 16946)
-- Dependencies: 245
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (id, name, destination_id, price_per_person, description, is_active, deleted_at, photo_url) FROM stdin;
68c4c066-a63f-4fd9-a3cb-744d294c0ddf	Tsomgo Lake	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	400.00	Tsomgo Lake, or Changu Lake, is a high-altitude glacial lake (12,313–12,400 ft) located 40 km from Gangtok in East Sikkim	t	2026-04-01 21:08:55.181	https://res.cloudinary.com/duxmcwrh3/image/upload/v1774188933/crm-masters/activitys/wmnfbpjtxczcjpsxidiu.jpg
\.


--
-- TOC entry 4261 (class 0 OID 16645)
-- Dependencies: 237
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, created_at) FROM stdin;
0794a187-daed-43b7-abf8-ac5bcc1b88ce	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "master.manage"}	::ffff:100.64.0.2	2026-03-20 15:14:17.531
7eda9f68-e37a-48eb-b23a-11fe7ee4b9b7	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "master.manage"}	::ffff:100.64.0.2	2026-03-20 15:14:22.253
4987f1de-be45-4da4-9939-9b3578dec475	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "master.manage"}	::ffff:100.64.0.2	2026-03-20 15:14:23.523
b4db9dc0-c5f9-4254-a9f4-a7e71121e2d0	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "master.manage"}	::ffff:100.64.0.2	2026-03-20 15:14:24.269
27a828bf-b7ab-4955-91c6-225ebf628d61	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "user.manage"}	100.64.0.3	2026-03-21 09:23:23.269
86789c8c-4ed5-451c-9ff8-1ec9a925cc3e	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "user.manage"}	100.64.0.3	2026-03-21 09:23:23.271
3f044c31-b1f1-4bcd-9055-c5580c4ce3d0	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "user.manage"}	100.64.0.3	2026-03-21 09:23:24.359
04f19902-9a2f-4a43-bd11-f2a9db1dd1f3	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "user.manage"}	100.64.0.3	2026-03-21 09:23:24.359
3274232a-042b-4f6a-8fd1-e4816a318095	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "user.manage"}	100.64.0.3	2026-03-21 09:29:04.732
b89b8e6a-cb57-4df8-850f-7c96bc59cf6a	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "user.manage"}	100.64.0.3	2026-03-21 09:29:04.732
11ed977d-5faa-47ba-80d7-fff070e46e71	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "user.manage"}	100.64.0.3	2026-03-21 09:29:05.824
bf65390b-c6b4-4fca-ab48-b857f0c25a0f	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "user.manage"}	100.64.0.3	2026-03-21 09:29:05.825
2be72320-ebb2-4c43-91ec-ea3d4fe74eee	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.83.137	2026-03-21 20:44:10.408
e1c8f491-b655-4e1b-8f49-a762314b001c	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.83.137	2026-03-21 20:44:11.49
713b03b7-4441-4287-8def-25bfc9116ac9	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.83.137	2026-03-21 20:45:05.503
ba153805-c8c3-4192-b89a-33a9abc22b9b	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.83.137	2026-03-21 20:45:06.58
033f3f89-a17b-457c-b8db-8c10c917c56d	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.83.137	2026-03-21 20:45:32.224
acdea91d-82fd-408f-8894-104d21afb78d	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.83.137	2026-03-21 20:45:33.307
43b692b5-7ceb-4818-b040-d0e442ae9a84	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.83.137	2026-03-21 20:45:34.744
ddb990ee-0960-4624-9974-eb73b74c759f	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.83.137	2026-03-21 20:45:35.827
30a65cf6-2a05-42f6-80cf-b0a94e288ae7	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:01:09.539
90efa699-2549-4179-b753-1520cafbb79a	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:01:10.621
358a6b64-13d5-49f9-8427-3493dd386b8c	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:01:13.368
fd1ad80e-a752-4230-b09c-6469f9641416	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:01:14.45
c71d095d-a03f-4cc7-925e-ae9c5291f98e	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:02:44.527
09442a20-ad17-4e80-b0a6-299796e698b1	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:02:45.613
ae2f4509-3d56-49ec-a9bd-d87316f6a467	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:03:07.788
cad08335-14bc-4959-8ada-37c964c85032	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:03:08.866
fb416992-b605-4809-b100-0064f103330c	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:05:53.042
a12f4b97-5fda-4dfc-ba4f-46c8b0fa184c	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:05:54.677
18be46f7-895d-4082-9f4a-b870e823052a	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:05:55.779
a2f58770-2abc-448e-880c-daef2042a1b0	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:05:57.263
89a72682-8a0f-4d26-9c67-cc38403cda37	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:05:58.573
db167aa2-6864-40ed-a981-a20fbbb46359	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:06:00.325
7375e11f-6e9b-4c2e-9821-c5aa2d0f62aa	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 13:06:01.415
e380e0fa-33ac-4fff-b646-1185a089264c	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:40:00.776
70f7a8a1-5d51-4c59-9800-0b4a2071a7f6	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:40:01.882
f4a6b5b5-b826-4b17-a161-712323389ab2	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:43:57.175
855e3867-c0ac-4c3c-ad91-cc46efc8cbcc	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:43:58.26
4b15d259-9d08-43ca-b190-b96cecc155b7	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "users.manage"}	223.233.84.19	2026-03-22 20:31:47.901
3d6329cb-1824-48be-a753-27328913e9df	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:43:59.917
8f536111-e658-43c5-9327-eca4e9f1888e	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:44:01.006
a22c70cf-960f-475b-9bc5-2cb3b4a079ba	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:45:31.019
b3e289a1-e28e-418e-80cd-9b3014fb8a6c	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:45:32.106
9a5d5226-2b9b-4dc6-ad59-49e25247368f	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:47:00.466
3dc317ca-5d75-4ce4-819d-8fc855e554ea	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:47:01.575
674babda-7ac1-46b5-82df-1cdbaaacfdc0	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:52:59.069
e584998e-e8d0-4a63-95ae-2edb558bd802	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:53:00.173
2510d660-bd97-4a5c-b1c0-a17fa5626c4b	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:53:02.167
b4da92bf-ea54-4a71-92de-b0725d513813	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:53:03.259
cddd1588-e9b2-49c7-a7e6-7b3b7b358213	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:53:26.644
a42f3bfd-046c-4e29-a286-128ce425b7bf	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:53:27.74
906fbe02-d66b-45ee-a1fb-fee3da584668	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:53:34.641
777ebd39-4e69-445c-881e-8d8ef9e48121	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:53:35.755
2b149c96-833f-4b95-96e2-fa7b21e61dac	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:53:41.375
fb48c4c5-435c-454a-8258-b0e4a45532c0	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:53:42.473
bd8a0325-d89c-4f5a-a488-bd07792644c4	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:53:43.94
36ebb89a-703e-4fb8-aea0-6f82636e1aa7	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:53:45.058
6090659c-ac46-44ba-934c-82057aa53059	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:54:00.508
56ad841d-a639-4f80-b05b-10f9608e8071	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:54:02.679
5ff7691e-b0b6-4a10-a217-01699209039a	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:54:20.849
786a9c0c-506c-4cbb-a69d-bf75d89578b8	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:54:21.943
3ee97708-b5e3-4be7-8bfb-0595c670e0a7	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:54:34.83
655ecd78-7140-484d-8111-2130c16cb81d	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:54:35.935
fe04aae6-037d-4015-8c91-f9ae8f7d2ab4	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:54:52.377
891c4d3e-e309-4a9c-b026-7f931820affb	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:54:53.483
a63b63d4-461b-4189-a400-04149a4e0364	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:54:57.944
e771bf3b-e96e-40c5-97eb-55f3fabaddb7	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:54:59.047
040dd097-72d7-46f0-aceb-f79335112b47	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:55:02.216
2a12afd9-b603-475f-a454-d9300ac44695	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:55:03.387
e1175bc0-3e93-4fb9-a895-c379441ae2e3	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:56:50.147
7f5c3d18-71cd-4a96-8f1e-a9ee4580d50c	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:56:52.117
a13cdae7-c646-481b-8370-fdd8472ddd07	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:56:53.208
33c3a798-595e-4c3f-8df5-aa9d6857086f	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:57:21.175
8f73b029-f768-427f-9890-31693eca2196	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:57:22.277
137863e8-ae9c-4448-985d-d0eb15a923e0	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:57:25.054
2debd35f-bfb2-43a3-b31d-156b2e68aeee	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:57:26.157
4a9d1a0f-094e-418f-90e6-bb0f14d24f90	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:57:28.299
10f9cf38-3e9e-4a44-ba39-42b8bf517202	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:57:29.409
68ee6a7c-7a4a-4cb3-9333-6659270836d0	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:57:35.806
91a4bf77-c07a-43b1-94ef-0cedbe074012	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:57:36.917
9ae74d1b-e3c6-4c28-923f-c0d160987c07	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:57:39.315
fdd9fb3f-2c14-4b6b-be03-2bb3169ef69b	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 14:57:40.407
973a010e-5ac5-465f-99bc-2daf4bd38ce1	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:02:58.958
ceb2fa99-d778-4721-8fb4-eab0f25538d2	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:03:01.589
dd90ada9-f2e0-44e6-8e13-38d028560e7e	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:03:02.678
702d8882-0f49-4b31-8d4e-53305399d46c	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:14:52.81
bc6325ec-d779-4075-b526-c9685b698f93	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:14:53.898
94915a39-8a05-4519-907e-70dd09a546e6	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:15:00.118
9120a3f4-38cc-41db-90d4-578c85ee063d	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:15:01.211
b32c1154-a59b-4f32-8266-85bcb7849ff5	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:15:29.823
c664fa43-d412-4852-939c-19296d00d36d	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:15:30.904
e8e1a8ac-62cd-474a-a6e6-adb710c15017	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:15:34.857
76316626-2bd4-4ceb-96fa-98de9a7b02c4	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:15:35.94
486c49a8-c7e8-4789-9dc6-002e643154b0	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:15:46.964
ac1cda77-7ce6-410e-8af4-1864fcaa3f3b	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:15:48.05
73793de4-1dfa-4e26-bdfe-28620de1dd29	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:22:04.725
32e96bb7-378b-43ea-bce0-7d861f595288	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:22:05.814
a4748980-308a-43d6-8604-3d66252a8fc5	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:22:33.701
acfccc6d-bf0c-4c21-b814-838bc1aacdd4	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:22:34.783
41be4913-0bb0-4c16-8e80-e4b511416c54	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:23:06.955
a4c34290-0e9a-4120-a823-7bd83964a60f	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:23:08.038
5b610422-620d-4aa2-b625-e27fb4069220	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:23:09.651
8c9bb86a-c84d-44ff-a840-1f0a776ddfdf	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 15:23:10.739
05889653-68f5-478b-83df-80d66764b3bf	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 17:19:11.095
d76e4b93-416e-4737-b105-8be73a67945e	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 17:19:12.187
aa06b238-0b49-48d7-b6a4-b54969802e15	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 17:19:17.219
8bf6fc9f-1bfe-4ab2-94cd-5c825b998ac2	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 17:19:18.333
2fb85a14-bab8-489b-9fde-aa698ae00556	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 17:19:19.407
bc21fa7d-cb12-4beb-bd59-10e6708141d4	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 17:53:06.325
36769adf-213f-4459-a604-4f1770e5ad50	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 17:53:07.403
265268be-f68f-473a-8eab-2ba31b8df903	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 18:03:24.775
c78d327e-21c8-41e8-af94-a0b620f561b7	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 18:03:29.828
0f15e534-257f-48d3-b87a-de2d66a7b308	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 18:03:30.912
a9ea5e21-3240-41ae-adf7-05032f97f6f0	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 18:04:23.826
e745742d-9730-4a1d-9d34-abd11047bc52	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 18:04:24.906
25ec415d-0c9e-47bd-a0a5-a7c3b9121b12	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 18:04:36.809
27f3cd76-8f7a-4fa4-88bd-902771075846	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 18:04:37.892
090871d4-31a0-4d6a-8130-485bb07ed457	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 18:22:03.742
3c6723ce-8841-43c4-a25d-70fed6d3d15c	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 18:22:04.86
2f54177f-89cc-44b0-be65-599bd3e13fde	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 18:22:17.747
01d69f51-cb40-4709-b52d-bbd4cff4d0c2	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 18:22:18.936
bb374976-ea89-434c-a541-a3ef4e665ed6	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 18:22:20.017
23b62e8b-f246-45b9-a19f-9c614eec51b7	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 20:43:45.924
a049d09f-74fa-4cee-ad8d-74fe5608bee1	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 20:43:47.008
57f2c0a1-520d-4bbe-91a2-cab1bedf20ee	510f6989-6adf-4cc6-bd94-96003cd2ae15	payment.recorded	query	630d27a2-f961-4958-b554-2c08d3a05c20	\N	{"mode": "upi", "amount": 1000, "reference": "638393937"}	\N	2026-03-22 20:44:03.091
21fd76df-c5f0-4c68-b93f-2a14de058178	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 20:44:12.842
3c3e72e3-03ac-4ecf-a0c1-9820dd9d954e	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-22 20:44:13.923
88eaad04-99a8-4b2b-b56a-734560749db4	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-23 19:59:06.837
a7604837-b73d-4620-b9e1-2a9aa34bd004	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-23 19:59:07.917
34cb507f-5b52-4637-928e-4bcad3284220	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-23 19:59:10.584
5b79dcd3-0876-45a5-a623-20401d73e15b	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-23 19:59:11.66
18d8738f-a416-451d-8857-2ee5c6c11f73	510f6989-6adf-4cc6-bd94-96003cd2ae15	payment.recorded	query	630d27a2-f961-4958-b554-2c08d3a05c20	\N	{"mode": "upi", "amount": 200, "reference": "Em"}	\N	2026-03-23 19:59:39.377
66b53bde-b047-47d6-91b5-2c9f11c737b2	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-23 19:59:47.795
7315e39e-2510-458f-b3e8-46b60702cc33	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.84.19	2026-03-23 19:59:48.871
f8d31fca-0a35-4892-9564-92e9bae74423	510f6989-6adf-4cc6-bd94-96003cd2ae15	payment.recorded	query	630d27a2-f961-4958-b554-2c08d3a05c20	\N	{"mode": "upi", "amount": 5000, "reference": ""}	\N	2026-03-23 20:00:09.185
fbc634ed-7e5c-4b2e-bb23-097900014b57	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:06:24.112
70317238-4085-4f5c-ba64-5830c7387480	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:06:25.2
71de0c38-395d-4f94-a835-08b4f9ac3c48	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:06:26.098
fb07c513-f1b6-46a2-8fd2-f1eae09e298f	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:06:27.18
3ff17dae-2bab-4f4f-b8c2-6418050c21b5	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:06:47.796
49959dec-86db-4436-a55f-5953830c54ea	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:06:48.867
1126b8bc-6a47-4c42-886e-228797bf1bdc	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:39:01.555
cc854e15-3958-4bed-927e-7e3b6471387d	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:39:02.656
3352cfe8-a447-47f1-ac66-72baf139c54a	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:39:05.65
6b740bf0-2e50-4de3-80ab-355c6105fcf8	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:39:06.744
f1a010db-2ec4-4658-b6db-81ab22ae625e	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:39:32.836
c0153de0-020c-4de6-942b-ebf5d21d792d	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:39:33.927
d94733c6-e74c-4ec5-8140-ae9f3c9427c9	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:39:47.927
5d922777-8ccb-4c0d-8c6e-ef78d6b065dc	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 18:39:49.019
565a2afc-4835-4e49-8f68-97a24d6bfa52	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 19:02:48.772
86117ddc-18ab-49ec-b67c-79d554671720	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 19:02:49.856
817db8c0-4500-4d37-9516-5f682d793cb3	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 19:03:43.785
0780715b-3d82-4e5d-8010-91b04a178b3d	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 19:03:44.869
01e1e1e9-7114-4dcb-bd54-27e3bb86a808	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 19:04:19.229
4aa1220e-53bd-42a8-aaf9-238524d1388b	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 19:04:20.314
4e619d2b-fd13-46bd-87db-d60ee0ea4460	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 19:04:21.909
34946afc-e142-49ec-bd85-fded7f71e3ee	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 19:09:21.469
32429a02-cac0-406a-b801-441089389200	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 19:09:22.562
fadfa300-8486-487b-8e00-815f306da240	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 19:10:09.71
863f93e5-0c95-4a37-a313-d9cce955a62d	510f6989-6adf-4cc6-bd94-96003cd2ae15	permission.denied	system	\N	null	{"role": "admin", "permissionKey": "query.view"}	223.233.85.126	2026-03-24 19:10:10.792
6f1360d1-68be-407b-aed7-1557c63ae9d7	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "proposal.view_assigned"}	223.233.83.137	2026-03-21 22:09:25.063
782bb21b-3506-4c38-9a25-5525a1102ecf	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "proposal.view_assigned"}	223.233.83.137	2026-03-21 22:09:26.187
24e61518-0f30-4452-b482-32f311a4438b	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "payment.view_all"}	223.233.83.137	2026-03-21 22:09:27.521
ab2599c9-b43e-47c6-83c2-c866c72251e6	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "payment.view_all"}	223.233.83.137	2026-03-21 22:09:27.516
2a694d74-3b50-49aa-b660-263e5c07d4da	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "query.view_all"}	223.233.83.137	2026-03-21 22:09:28.43
52caee0d-f995-48b7-bd39-bcf272b81b64	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "query.view_all"}	223.233.83.137	2026-03-21 22:09:29.53
3c4bd904-7525-4b42-b109-1ea41341e3dc	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "payment.view_all"}	223.233.83.137	2026-03-21 22:09:50.085
8d8c4420-446e-4546-8cf9-f8f2b6727cdf	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "payment.view_all"}	223.233.83.137	2026-03-21 22:09:51.194
222c4a1e-aa0e-4cc1-98b2-80b9cbedb732	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "users.manage"}	223.233.83.137	2026-03-21 22:09:52.057
7eb09602-6bde-46f3-8f60-0bfefd2682d5	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "users.manage"}	223.233.83.137	2026-03-21 22:09:53.169
c288d4ed-a3b8-4534-9328-d0d40b9eeafd	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "users.manage"}	223.233.83.137	2026-03-21 22:09:53.923
957e4ba1-c9e6-449f-a7cc-1f4d3f216137	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "users.manage"}	223.233.83.137	2026-03-21 22:09:55.058
1ad329a3-fd61-4902-bb54-73e2c9ef3d1c	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "users.manage"}	223.233.83.137	2026-03-21 22:09:55.821
34071903-ba9f-49a5-b026-4da745f3e480	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "users.manage"}	223.233.83.137	2026-03-21 22:09:55.821
96bb13b7-f9d3-4c7d-bfa1-91de00593a91	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "users.manage"}	223.233.83.137	2026-03-21 22:09:56.937
25e91cec-ab6c-411a-91ee-d5a2ad86852e	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "users.manage"}	223.233.83.137	2026-03-21 22:09:56.945
ba4002b2-a311-4e52-ac4c-8e4d0a7ee511	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "users.manage"}	223.233.84.19	2026-03-22 20:31:47.902
ebd2f926-1f16-415e-8a35-3e7f2c8ffe9f	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "users.manage"}	223.233.84.19	2026-03-22 20:31:49.023
4b633807-7513-4d10-95a2-971d6e22a00c	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "users.manage"}	223.233.84.19	2026-03-22 20:31:49.024
d48524df-328c-43a1-b59d-aa4bb7b569d3	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "query.view_all"}	223.233.84.19	2026-03-22 20:32:03.566
2c9d7b3a-2b5d-42fd-9487-db5d99babffc	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "query.view_all"}	223.233.84.19	2026-03-22 20:32:04.669
46cb1de1-6a0b-40d0-8101-3ebbd9dea907	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "query.view_all"}	223.233.84.19	2026-03-22 20:32:06.328
997cf394-65d1-49f7-bd7c-eae37659de82	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "query.view_all"}	223.233.84.19	2026-03-22 20:32:07.451
590d3c55-9cb1-4b93-8aae-05a199cec7c3	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "query.view_all"}	223.233.84.19	2026-03-22 20:32:08.172
f907d083-664b-4f78-8e3d-c0228f4e9dfd	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "query.view_all"}	223.233.84.19	2026-03-22 20:32:09.295
3c968740-1f81-42ef-9f07-ea82bdb84842	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "query.view_all"}	223.233.84.19	2026-03-22 20:32:14.055
2ad0b49d-679d-47fa-815d-58a9ed5b7926	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "query.view_all"}	223.233.84.19	2026-03-22 20:32:15.156
dc2c3c4d-1629-4aa4-be8b-ef596c6c2937	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "proposal.view_assigned"}	223.233.84.19	2026-03-22 20:32:31.11
355957cd-a00a-4eb8-83e5-f31a936dee9b	\N	permission.denied	system	\N	null	{"role": "ops", "permissionKey": "proposal.view_assigned"}	223.233.84.19	2026-03-22 20:32:32.227
8b7d57b5-4214-4e57-afd0-6121b4059e2f	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "tour.view_assigned"}	223.233.83.137	2026-03-21 22:13:16.615
eaa9d906-2c4d-49f7-be9f-cfde2c6f13d6	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "tour.view_assigned"}	223.233.83.137	2026-03-21 22:13:17.751
982f1246-d3ec-4a6f-abe0-5e22a652d6fd	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "users.manage"}	223.233.83.137	2026-03-21 22:13:54.593
9c64dd94-c2c9-475e-b1e6-7741baf2e545	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "payment.view_all"}	223.233.83.137	2026-03-21 22:13:55.666
e82cb0c7-ba39-41f5-854d-742834a096fa	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "payment.view_all"}	223.233.83.137	2026-03-21 22:13:56.758
33ae28ca-6e12-44fd-a54c-2a64972beaee	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "payment.view_all"}	223.233.83.137	2026-03-21 22:14:01.395
666cf2be-4b89-4c03-b776-50cd1bbeb244	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "payment.view_all"}	223.233.83.137	2026-03-21 22:14:01.396
70c2b6fa-6742-4366-9490-1660c4bf5930	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "payment.view_all"}	223.233.83.137	2026-03-21 22:14:02.491
4123b894-9991-4706-a0d9-b33263e18d5e	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "payment.view_all"}	223.233.83.137	2026-03-21 22:14:02.499
8249dd19-5b16-4ff5-bf5e-5492078c51ad	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "tour.view_assigned"}	223.233.83.137	2026-03-21 22:14:21.945
82494e29-411f-447a-ad6a-4dd764185f34	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "tour.view_assigned"}	223.233.83.137	2026-03-21 22:14:23.038
d8d031a0-6e87-4fb1-a7bb-d431d5050be2	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "tour.view_assigned"}	223.233.83.137	2026-03-21 22:14:28.097
12e2aee5-fc1c-4786-aab3-01254e0883de	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "tour.view_assigned"}	223.233.83.137	2026-03-21 22:14:28.409
c6bd2174-afeb-4a30-b3ec-d3e159d07743	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "tour.view_assigned"}	223.233.83.137	2026-03-21 22:14:29.565
45a202b9-be72-438b-a3ad-56869ef9296a	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "tour.view_assigned"}	223.233.83.137	2026-03-21 22:14:33.364
2134bfe3-4319-4f97-8605-298a5eac3e40	\N	permission.denied	system	\N	null	{"role": "sales_manager", "permissionKey": "tour.view_assigned"}	223.233.83.137	2026-03-21 22:14:34.518
f58e2163-fadd-4918-9c35-c36e3322cb9f	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	c3e98583-a729-4f2a-985f-53f0588966ce	\N	{"amount": 4800, "version": 1}	\N	2026-03-25 13:01:54.124
bd6f8ce3-7179-45b8-b4a8-efab58311ce8	a860dff1-8690-4627-bb5b-faefe169d02f	payment.recorded	query	c3e98583-a729-4f2a-985f-53f0588966ce	\N	{"mode": "upi", "amount": 4000, "reference": "89369836"}	\N	2026-03-25 13:02:56.034
05a1eadb-bb20-42af-83ae-a89bb0ecc5e7	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	55af5810-88a6-4291-b2ed-3b44d8da3ea8	\N	{"version": 1, "newItinerary": "4972d723-ac4b-4f44-aa65-1070af24a9d0", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-02 22:57:15.055
068b5634-4eee-4238-a7ba-db5b1cb3dff7	a860dff1-8690-4627-bb5b-faefe169d02f	payment.recorded	query	55af5810-88a6-4291-b2ed-3b44d8da3ea8	\N	{"mode": "upi", "amount": 6000, "reference": ""}	\N	2026-04-02 23:46:12.714
76c9f7f6-5dbb-45ef-952a-fc89485025bc	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	73e001d9-91fd-4fe1-a234-08740109f266	\N	{"version": 1, "newItinerary": "bd43c724-60e0-4f41-a446-22cb5b15856f", "fromItinerary": "4972d723-ac4b-4f44-aa65-1070af24a9d0"}	\N	2026-04-03 00:17:52.878
c8e6bbf4-c0f0-4194-bf50-dab6c6310940	a860dff1-8690-4627-bb5b-faefe169d02f	payment.recorded	query	73e001d9-91fd-4fe1-a234-08740109f266	\N	{"mode": "upi", "amount": 2000, "reference": "67587687"}	\N	2026-04-03 00:20:24.658
c2160710-5523-4055-b3c1-8634cdf5340e	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	14163fc8-ba94-4925-b503-0c67662ea9c1	\N	{"version": 2, "newItinerary": "89f8cd1c-c07b-4974-ada6-c5b193da8a97", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-03 00:38:00.373
8e8faa53-1860-41dd-935c-12ce7f757b9d	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	14163fc8-ba94-4925-b503-0c67662ea9c1	\N	{"version": 3, "newItinerary": "1764f996-b3fd-4814-b01f-d090ea694ef6", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-03 00:38:07.701
abf90487-28b8-46f5-a7fc-ce33799ccaf2	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"version": 1, "newItinerary": "83ebd5c7-bb92-47d8-a976-f73286c2d5ad", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-03 13:38:58.573
6fd5ab3e-0b8b-4fd3-a267-2f47b512a930	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"version": 1, "newItinerary": "6184c7d5-776a-4f9f-a9cb-49bafc8acd15", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-04 00:46:44.886
561d78b5-81fc-4f8e-9a5e-1407e358f3a7	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"version": 1, "newItinerary": "e4b7f9ef-f5d2-4e80-9101-fd0476768b24", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-04 01:08:12.124
14e4693f-ab59-451c-a21a-a583678329ba	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"version": 1, "newItinerary": "972d8de3-66fe-46e6-ac53-a1fedc5632fc", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-04 01:09:12.814
5cf1c8c4-695e-4567-a6fd-9d7e932e436c	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.confirmed	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"tourId": "c240f352-0bd1-4627-9174-f2c2838af2e0", "version": 1, "tourCode": "TUR-2026-001"}	\N	2026-04-04 01:09:29.884
8ad31ffe-edb0-484e-a29d-5401ea57f6ae	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"version": 1, "newItinerary": "615a7192-2158-4907-8f2b-69ce38fd2c9d", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-04 01:31:26.959
24231e25-a9a1-415d-9015-5032a3696ea4	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.confirmed	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"tourId": "c240f352-0bd1-4627-9174-f2c2838af2e0", "version": 1, "tourCode": "TUR-2026-001"}	\N	2026-04-04 02:13:11.362
6c23e7ce-42a1-4f98-ba44-35f79869b870	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"version": 2, "newItinerary": "2930cb83-3e69-4495-a858-9fc520d019c0", "fromItinerary": "33dfe3c4-2cec-428c-b133-12fcb29bd454"}	\N	2026-04-04 04:57:42.19
72eda27a-c643-45e5-a452-da936067591b	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"version": 2, "newItinerary": "c6256659-08e8-4e4b-b208-ff2accae92ab", "fromItinerary": "b8648df3-51cf-4a49-8ba2-9e224194bb10"}	\N	2026-04-04 05:36:47.741
84e35525-96e3-4809-9bbe-e8653d14a6b5	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"version": 1, "newItinerary": "0fe6eea6-3c10-4d1f-ab2a-dc015703a28b", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-04 06:46:38.71
968f8493-ed6e-48bd-ba41-dbc72a2dd002	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.confirmed	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"tourId": "c240f352-0bd1-4627-9174-f2c2838af2e0", "version": 1, "tourCode": "TUR-2026-001"}	\N	2026-04-04 06:46:41.627
05892105-53dc-45f9-ab77-461450cf9fb7	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"version": 2, "newItinerary": "e7b49398-c6cf-4318-8c3a-cf102f2be76e", "fromItinerary": "f5d551b1-647c-476c-95f9-5036db31e6fa"}	\N	2026-04-04 06:59:44.331
610be3a1-d39b-4c42-ac6a-066d62fa146c	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.confirmed	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"tourId": "c240f352-0bd1-4627-9174-f2c2838af2e0", "version": 2, "tourCode": "TUR-2026-001"}	\N	2026-04-04 06:59:50.261
7b9d6057-8b72-4f18-8082-b39a3bddf75c	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 1, "newItinerary": "e6aede20-a35b-49ce-97f2-38cb098c0579", "fromItinerary": "f5d551b1-647c-476c-95f9-5036db31e6fa"}	\N	2026-04-04 08:18:05.105
3831a95f-96c6-497b-9094-7693b22520d6	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 2, "newItinerary": "8c37b487-44b0-418c-a8c1-04cd9567e39b", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-04 08:18:08.515
df160194-8dcb-48e8-b4d1-6ac09ecc5d2a	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"version": 2, "newItinerary": "16010103-8491-4406-b5cb-3d42fb03dc4d", "fromItinerary": "f5d551b1-647c-476c-95f9-5036db31e6fa"}	\N	2026-04-04 08:19:00.533
c0c3f190-20cf-4d2b-bf4a-f3f345638965	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	56f43237-675f-4a9a-80ad-f3be1b7d8962	\N	{"version": 3, "newItinerary": "6d8bf505-3c8d-4ba6-9a8f-3291703a87d8", "fromItinerary": "f5d551b1-647c-476c-95f9-5036db31e6fa"}	\N	2026-04-04 08:19:08.927
3d63f90c-7137-4a45-b6db-b896a74bd46f	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 1, "newItinerary": "27b10c1d-5542-4c8b-8311-6dcb4a76e026", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-04 16:24:29.678
a7d75ee3-99be-40c2-adbd-14f6d2c4ef41	\N	proposal.pdf_downloaded	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 1}	\N	2026-04-04 16:33:24.192
4fac50ce-d423-4738-b7b3-f65185cec763	\N	proposal.pdf_downloaded	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 1}	\N	2026-04-04 16:35:32.984
76f3a1cf-b6a6-40ed-9baf-7d179f0579bc	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 2, "newItinerary": "9e09df64-62d1-4bd9-a90b-cb52eb9a2dd0", "fromItinerary": "f5d551b1-647c-476c-95f9-5036db31e6fa"}	\N	2026-04-04 17:16:12.458
c65146e9-48d8-4af4-b868-ca6d0a2ab282	\N	proposal.pdf_downloaded	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 2}	\N	2026-04-04 17:18:01.016
821d6095-14a0-4c4c-ad29-3a893c9da1e3	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.confirmed	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"tourId": "992a2ece-b417-4636-bc55-db7094eaa887", "version": 1, "tourCode": "TUR-2026-002"}	\N	2026-04-04 17:20:02.288
7c6892b9-3f5c-442b-8596-23f94a1dda39	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	777c632b-52b7-46d3-9bf8-fb3e591b372f	\N	{"version": 1, "newItinerary": "2bf89103-3d87-4629-8062-3be48123177c", "fromItinerary": "f5d551b1-647c-476c-95f9-5036db31e6fa"}	\N	2026-04-04 17:20:35.271
4e16abcb-faec-4316-b7bf-92ae57df7795	a860dff1-8690-4627-bb5b-faefe169d02f	payment.recorded	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"mode": "upi", "amount": 2000, "reference": "8279238"}	\N	2026-04-04 17:22:10.336
168af00e-d29f-4cd9-a11a-c0a104164f6c	\N	proposal.pdf_downloaded	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 1}	\N	2026-04-05 14:17:18.675
91d657e6-ce63-4d41-b139-328a34438568	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	2eda62ee-c966-42c9-a264-87acc98c0482	\N	{"version": 1, "newItinerary": "3bbc19c9-257e-490f-b266-2e36d112e9f9", "fromItinerary": "f5d551b1-647c-476c-95f9-5036db31e6fa"}	\N	2026-04-05 15:14:46.363
a981b546-d176-4f38-b8db-09fb35a8e4cd	\N	proposal.pdf_downloaded	query	777c632b-52b7-46d3-9bf8-fb3e591b372f	\N	{"version": 1}	\N	2026-04-05 20:14:28.17
b273941f-dd35-4e69-a88b-5b5a021c861e	\N	proposal.pdf_downloaded	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 1}	\N	2026-04-06 00:50:09.615
b9e4cf8c-a70c-4b69-9173-7df796d4d876	\N	proposal.pdf_downloaded	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 1}	\N	2026-04-06 00:58:20.81
1083a85d-17fe-4ad9-a716-e0aabb839be2	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	777c632b-52b7-46d3-9bf8-fb3e591b372f	\N	{"version": 1, "newItinerary": "ca7cf7bc-765d-4fea-8963-d5c0b5273f1a", "fromItinerary": "f5d551b1-647c-476c-95f9-5036db31e6fa"}	\N	2026-04-06 00:58:57.513
f10c7611-71b3-4801-a5ec-13974d9f4fd0	\N	proposal.pdf_downloaded	query	777c632b-52b7-46d3-9bf8-fb3e591b372f	\N	{"version": 1}	\N	2026-04-06 01:00:21.395
09c6990d-089b-42d6-859b-ec4dd251eb2d	\N	proposal.pdf_downloaded	query	777c632b-52b7-46d3-9bf8-fb3e591b372f	\N	{"version": 1}	\N	2026-04-08 18:49:48.205
faee2b0d-a67b-454b-ba9c-b9cbed4ad3d5	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 1, "newItinerary": "bb600f5c-f403-4356-9f85-4b3c02bb5523", "fromItinerary": "27b10c1d-5542-4c8b-8311-6dcb4a76e026"}	\N	2026-04-09 05:59:37.061
4363903d-837a-4446-997b-ada79bce935c	\N	proposal.pdf_downloaded	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 1}	\N	2026-04-09 08:18:42.085
81700a93-dc91-4142-9a90-71b3107393ed	\N	proposal.pdf_downloaded	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 1}	\N	2026-04-09 08:37:13.321
d5209be9-eea2-4ede-8691-7bb44ef50575	\N	proposal.pdf_downloaded	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 1}	\N	2026-04-09 08:56:07.256
3a40e9fe-00a8-47ea-a7d3-5522bab49fa4	\N	proposal.pdf_downloaded	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 1}	\N	2026-04-09 11:52:23.51
182a1efa-d8d5-4565-880d-d700cb358664	\N	proposal.pdf_downloaded	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 1}	\N	2026-04-09 15:54:31.009
8f3c8c92-056a-4715-ac7f-c9b68aecc3b2	\N	proposal.pdf_downloaded	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 1}	\N	2026-04-09 16:05:09.682
f2b6bf60-bcb4-40b8-95f9-5ce7b9cdb315	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 2, "newItinerary": "f21339a4-bf54-44b7-acc2-06d29fed6f9d", "fromItinerary": "83f4406f-5799-4252-a7b7-8718a9e49530"}	\N	2026-04-09 16:08:12.343
da84440c-4096-4988-89d7-d15b5adf7fd1	\N	proposal.pdf_downloaded	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 2}	\N	2026-04-09 16:08:21.917
6ab24388-0431-4eb0-882f-ba3cdc4d7ee2	\N	proposal.pdf_downloaded	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 2}	\N	2026-04-09 16:10:19.133
12c3f672-4151-4556-a955-48f2bd520272	\N	proposal.pdf_downloaded	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 2}	\N	2026-04-09 18:19:04.542
1d1415af-4a97-46da-88d0-c7004a5e91b8	\N	proposal.pdf_downloaded	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 1}	\N	2026-04-09 18:26:22.947
823a805c-c179-4948-852d-818806aa4b6c	\N	proposal.pdf_downloaded	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 2}	\N	2026-04-09 18:39:36.892
5a1d37c8-80b2-4db5-bc75-c8277f547c31	\N	proposal.pdf_downloaded	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 1}	\N	2026-04-09 18:55:57.744
671c6efd-24cd-403a-b0df-37c3932af586	\N	proposal.pdf_downloaded	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"version": 1}	\N	2026-04-09 19:08:55.387
1aefb7f3-bb2c-42ce-8d7e-ad288390db55	a860dff1-8690-4627-bb5b-faefe169d02f	payment.recorded	query	e403e125-595c-4df5-83ab-a6724e05988a	\N	{"mode": "upi", "amount": 10000, "reference": "6286238"}	\N	2026-04-10 02:13:01.488
44fe6809-a5a2-4d11-8cc4-2f255d938923	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 1, "newItinerary": "0dc216b0-2e16-496d-ac8c-3650bef26fc5", "fromItinerary": "83f4406f-5799-4252-a7b7-8718a9e49530"}	\N	2026-04-10 02:17:05.141
856950f6-279a-4f86-ba48-267b1ca34dff	\N	proposal.pdf_downloaded	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 1}	\N	2026-04-10 02:17:14.358
1dc4bfda-e9f3-49a6-8c31-bb7d279b2bce	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 1, "newItinerary": "19a94c0f-bb35-46bb-9625-756af72ca8e5", "fromItinerary": "83f4406f-5799-4252-a7b7-8718a9e49530"}	\N	2026-04-10 02:19:47.337
e42183d0-3ee2-469a-8b22-c4ab7ee4c27a	\N	proposal.pdf_downloaded	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 1}	\N	2026-04-10 02:20:29.254
555dd5f6-b8c4-4378-96a5-0c37d160349b	\N	proposal.pdf_downloaded	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 1}	\N	2026-04-10 03:25:40.689
29db9a0d-7eb1-4489-82f3-7afabfa12e34	\N	proposal.pdf_downloaded	query	495b81c2-268c-478c-b85c-02228b52bad5	\N	{"version": 1}	\N	2026-04-10 03:51:42.935
2c34266b-09f6-4cc2-aa40-ceb0f804b58e	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	\N	{"version": 1, "newItinerary": "0ad965a6-cdb0-4dbb-b594-4ac2070cbe58", "fromItinerary": "83f4406f-5799-4252-a7b7-8718a9e49530"}	\N	2026-04-10 04:39:22.967
891f847e-913b-42c8-878f-817e3c15d572	\N	proposal.pdf_downloaded	query	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	\N	{"version": 1}	\N	2026-04-10 04:39:32.835
92aac96b-44eb-47a8-9091-319b5dc262f8	\N	proposal.pdf_downloaded	query	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	\N	{"version": 1}	\N	2026-04-10 04:41:16.167
24beb81d-4b72-443c-8e41-df2bb1efa6df	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.confirmed	query	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	\N	{"tourId": "647eeb6d-c7ff-4138-8325-d28301be157e", "version": 1, "tourCode": "TUR-2026-001"}	\N	2026-04-10 05:05:31.375
96b49f04-6159-48fc-b564-36df2b95412f	\N	proposal.pdf_downloaded	query	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	\N	{"version": 1}	\N	2026-04-10 05:38:35.593
2a0341c0-733b-4421-9bcf-cf6e5babdf35	\N	proposal.pdf_downloaded	query	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	\N	{"version": 1}	\N	2026-04-10 06:07:12.609
3c00a03c-55b3-489c-bf03-a73beeca7ddf	\N	proposal.pdf_downloaded	query	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	\N	{"version": 1}	\N	2026-04-10 07:20:55.074
81687b07-6623-40df-9505-67af5ba42cfd	\N	proposal.pdf_downloaded	query	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	\N	{"version": 1}	\N	2026-04-10 07:55:14.14
b108f987-b5e5-478d-9a1d-e2510e79fc82	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	ff3f5da9-0d48-4cd4-b70b-709c2d121ee2	\N	{"version": 1, "newItinerary": "f8cdf0c6-8f94-4844-8dd7-82952db885f7", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-10 11:18:40.403
32138ac1-34eb-4d4c-ad6c-da047dd23f36	\N	proposal.pdf_downloaded	query	ff3f5da9-0d48-4cd4-b70b-709c2d121ee2	\N	{"version": 1}	\N	2026-04-10 11:23:23.775
0b23a145-9c9e-4fed-a207-4a74be64114d	\N	proposal.pdf_downloaded	query	ff3f5da9-0d48-4cd4-b70b-709c2d121ee2	\N	{"version": 1}	\N	2026-04-13 05:38:38.625
98d65f94-081a-489c-83ec-f5bc3d0463f2	\N	proposal.pdf_downloaded	query	ff3f5da9-0d48-4cd4-b70b-709c2d121ee2	\N	{"version": 1}	\N	2026-04-13 05:54:56.134
68c860a1-1f39-4461-870c-ec0a6732af7f	\N	proposal.pdf_downloaded	query	ff3f5da9-0d48-4cd4-b70b-709c2d121ee2	\N	{"version": 1}	\N	2026-04-14 06:21:35.426
93e59355-76e1-4b2b-9d36-426ff576859a	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	f4b8679e-75f2-42da-846e-0a697c9958eb	\N	{"version": 1, "newItinerary": "e17bcc9c-a96b-4ff0-a403-393c07ea7d8d", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-17 10:29:24.871
1ccea41e-be3c-4178-974e-f950362bff3d	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	2c8ad043-4e77-40a7-9b7f-26dc6b39b4b3	\N	{"version": 1, "newItinerary": "e54911c0-eaeb-4eea-beeb-41f89dd7e434", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-21 07:38:03.916
8051b000-06c0-4614-aab7-6fbccde98ad5	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	2c8ad043-4e77-40a7-9b7f-26dc6b39b4b3	\N	{"version": 2, "newItinerary": "21deb578-3d51-428c-bb96-b0705a0ee168", "fromItinerary": "83f4406f-5799-4252-a7b7-8718a9e49530"}	\N	2026-04-21 10:03:31.176
98f8c2bb-2c77-4300-8c35-0b9b7894a8e5	a860dff1-8690-4627-bb5b-faefe169d02f	proposal.created	query	2c8ad043-4e77-40a7-9b7f-26dc6b39b4b3	\N	{"version": 1, "newItinerary": "20c3aa9b-b85b-4be5-970f-21fc668f569b", "fromItinerary": "56bb8df4-4346-4b2c-8168-a4e4aa6255fe"}	\N	2026-04-23 07:30:52.276
16bfc46f-298c-4c5e-b085-136a645b3a02	\N	permission.denied	system	\N	null	{"role": "sales_exec", "permissionKey": "users.manage"}	167.82.160.97	2026-04-23 07:28:09.3
38f27a06-5f90-4b2e-bd85-3b8e057533c9	\N	permission.denied	system	\N	null	{"role": "sales_exec", "permissionKey": "users.manage"}	167.82.160.97	2026-04-23 07:28:09.304
99d56c65-3201-4eb7-b2f6-12421b283bde	\N	permission.denied	system	\N	null	{"role": "sales_exec", "permissionKey": "users.manage"}	167.82.160.97	2026-04-23 07:28:10.408
59ef6d16-449e-49e5-a5d6-7abfff2982b7	\N	permission.denied	system	\N	null	{"role": "sales_exec", "permissionKey": "users.manage"}	167.82.160.97	2026-04-23 07:28:10.41
8910b77c-f788-4a43-b86a-ad1726d6be89	\N	permission.denied	system	\N	null	{"role": "sales_exec", "permissionKey": "payment.view_all"}	167.82.160.25	2026-04-23 07:29:29.001
0ac9f46a-0bd9-485e-94b7-4a0a3692dcaf	\N	permission.denied	system	\N	null	{"role": "sales_exec", "permissionKey": "payment.view_all"}	167.82.160.25	2026-04-23 07:29:29.207
04fa2384-2fe3-47d0-85f4-7a918f3a1287	\N	permission.denied	system	\N	null	{"role": "sales_exec", "permissionKey": "payment.view_all"}	167.82.160.25	2026-04-23 07:29:30.104
3936f22d-96a9-4306-adb5-a0cb04bce5cd	\N	permission.denied	system	\N	null	{"role": "sales_exec", "permissionKey": "payment.view_all"}	167.82.160.25	2026-04-23 07:29:30.311
ca41ef6f-cdb5-4655-b80b-eee696fcd1a3	\N	permission.denied	system	\N	null	{"role": "sales_exec", "permissionKey": "tour.view_assigned"}	167.82.160.25	2026-04-23 07:29:40.278
3d8507b4-a2c6-4abe-b29c-c8c278af1ce0	\N	permission.denied	system	\N	null	{"role": "sales_exec", "permissionKey": "tour.view_assigned"}	167.82.160.25	2026-04-23 07:29:41.385
\.


--
-- TOC entry 4264 (class 0 OID 16871)
-- Dependencies: 240
-- Data for Name: b2b_agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.b2b_agents (id, company_name, gst_number, mobile, mobile2, email, email2, city, address, dob, anniversary, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4280 (class 0 OID 17133)
-- Dependencies: 256
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_posts (id, slug, title, body_html, excerpt, cover_image, author, tags, seo_title, seo_desc, is_published, published_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4288 (class 0 OID 17305)
-- Dependencies: 264
-- Data for Name: booking_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.booking_services (id, query_id, proposal_day_id, service_type, service_name, supplier_id, supplier_name, supplier_email, check_in, check_out, service_date, rate_per_unit, units, total_cost, supplier_amount_paid, supplier_amount_pending, mail_status, mail_sent_at, payment_status, confirmation_number, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4287 (class 0 OID 17251)
-- Dependencies: 263
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, city, address, phone, is_active) FROM stdin;
\.


--
-- TOC entry 4263 (class 0 OID 16856)
-- Dependencies: 239
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, name, phone, email, whatsapp, mobile2, address, city, date_of_birth, anniversary, passport_number, passport_expiry, lifetime_spend, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4276 (class 0 OID 17077)
-- Dependencies: 252
-- Data for Name: cms_pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_pages (id, slug, title, body_html, seo_title, seo_desc, is_published, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4274 (class 0 OID 17007)
-- Dependencies: 250
-- Data for Name: day_itinerary_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.day_itinerary_templates (id, title, destination_id, description, deleted_at, is_active, photo_url) FROM stdin;
46fa6445-9130-4aed-b0a9-61b1de9e2a4c	Lachung – Yumthang Valley Excursion – Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	After an early breakfast, proceed for a full-day excursion to the enchanting Yumthang Valley, also known as the Valley of Flowers. Located at an altitude of around 11,800 feet, this valley is a paradise of rhododendrons and snow-capped peaks. Spend some time amidst the serene beauty of nature and enjoy the breathtaking landscapes.\r\n\r\nYou may also opt for an excursion to the Zero Point (Yumesamdong), situated at an altitude of about 15,300 feet, where the road ends and the snow begins — a mesmerizing experience for adventure lovers. Alternatively, you can visit Mt. Katao (subject to permit and availability), known for its panoramic Himalayan views and snow-covered terrain.\r\n\r\nAfter completing the sightseeing, return to Lachung for lunch, then drive back to Gangtok. Enjoy the scenic descent through mountain streams and valleys. On arrival in Gangtok, check in to your hotel for an overnight stay.	\N	t	\N
c25b16e0-f85b-4e20-8c1d-e02f0df6685b	Darjeeling to NJP/IXB Drop 	3134f29d-8635-411f-a6dd-c2562eb7314d	After breakfast, check out from your hotel in Darjeeling. Begin your scenic drive towards New Jalpaiguri Railway Station (NJP) or Bagdogra Airport (IXB). The journey takes approximately 3 to 4 hours, covering beautiful tea gardens, rolling hills, and charming mountain villages along the way. Enjoy the last glimpses of the misty Himalayas and lush green valleys as you descend from the hills. Upon arrival at NJP/IXB, you will be dropped at your preferred location for your onward journey with wonderful memories of your Darjeeling trip.	\N	t	\N
7673f6d1-e757-4618-80b9-dca7589f9c7a	🌄 Day 1: Arrival at Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Pickup from NJP Railway Station / Bagdogra Airport\r\n\r\nTransfer to Gangtok (approx. 4–5 hrs)\r\n\r\nCheck-in at hotel (couple-friendly room)\r\n\r\nEvening: Walk at MG Marg 🛍️\r\n\r\nCandlelight dinner (optional add-on ❤️)\r\n\r\n\r\n🛏️ Overnight stay: Gangtok\r\n\r\n	2026-04-01 20:38:49.368	t	\N
59213176-a04b-4d13-b13d-d78a3f059a16	Day 2: Gangtok → Lachung	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Breakfast & departure to Lachung\r\n\r\nEn route sightseeing:\r\n\r\nSeven Sisters Waterfall\r\n\r\nChungthang Valley\r\n\r\n\r\nCheck-in at hotel in Lachung\r\n\r\nCozy evening with partner ❄️\r\n\r\n\r\n🛏️ Overnight stay: Lachung\r\n\r\n	2026-04-01 20:38:51.744	t	\N
dd90ded1-d003-4feb-8806-888f8a51f6a7	🌸 Day 3: Yumthang Valley → Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Early morning visit to Yumthang Valley 🌺\r\n\r\nOptional visit: Zero Point (extra cost)\r\n\r\nReturn to hotel → Lunch\r\n\r\nDrive back to Gangtok\r\n\r\n\r\n🛏️ Overnight stay: Gangtok\r\n	2026-04-01 20:38:54.391	t	\N
70128247-5b32-44f5-8d04-cc66a6cf6ea3	Departure Day : Lachung to NJP / Bagdogra (Approx. 9–10 hrs drive)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	After breakfast, check out from your hotel and bid farewell to the serene beauty of Lachung. Drive back through the scenic Teesta Valley, enjoying the last glimpses of the Himalayan peaks and lush landscapes. Enroute, stop for lunch and short photo breaks. By evening, reach NJP Railway Station or Bagdogra Airport for your onward journey with beautiful memories of Sikkim.	\N	t	\N
a65855b5-7a02-4a83-baa4-5cce44e1b6df	Ravangla – NJP/Bagdogra Drop 	8d90dd28-96a4-4799-a0f8-e4639dc823e8	fter enjoying a peaceful stay amidst the serene hills of Ravangla, it’s time to bid farewell to the beautiful land of Sikkim. Post breakfast, check out from the hotel and begin your scenic drive towards New Jalpaiguri Railway Station (NJP) or Bagdogra Airport (IXB). Relish the journey as you pass through lush green valleys, flowing rivers, and charming mountain villages. Upon arrival at NJP/Bagdogra, our representative will assist you with your onward journey, marking the end of your memorable Sikkim tour with wonderful memories to cherish forever. ✨	\N	t	\N
e19ab16f-1ac3-4e5f-93e3-97457caf49ca	Gangtok to Ravangla & Namchi Sightseeing (Stay at Ravangla)	8d90dd28-96a4-4799-a0f8-e4639dc823e8	After breakfast, check out from your hotel in Gangtok and begin your scenic drive towards Ravangla, a peaceful hill town known for its breathtaking Himalayan views and serene ambiance. En route, visit Namchi, the cultural capital of South Sikkim, where you can explore the Char Dham (Siddhesvara Dham) – a magnificent complex featuring replicas of the four holy Dhams of India – and the Samdruptse Hill, which houses the towering statue of Guru Padmasambhava. After exploring Namchi, continue your journey to Ravangla, visiting Buddha Park (Tathagata Tsal) on arrival, where a majestic 130-ft statue of Lord Buddha stands amidst landscaped gardens and mountain views. Spend the evening strolling around the local market or enjoying the tranquil beauty of this charming town. Overnight stay at Ravangla.\r\n\r\nI prefer this response	\N	t	\N
c0666e92-a2b5-41e8-aa46-167322efb8c9	Pelling Half Day Sightseeing and Transfer to Darjeeling	3134f29d-8635-411f-a6dd-c2562eb7314d	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\r\n\r\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads and tea-covered hillsides. On arrival, check in to your hotel and relax.\r\n\r\nOvernight stay at Darjeeling.	\N	t	\N
2b2f603c-f442-48f6-851d-3177244d1ac2	 Gangtok Half-Day Sightseeing and Transfer to Darjeeling	3134f29d-8635-411f-a6dd-c2562eb7314d	After breakfast, proceed for a half-day sightseeing tour of Gangtok. Visit the famous Banjhakri Waterfalls, Do Drul Chorten Stupa, Namgyal Institute of Tibetology, Flower Exhibition Centre, and Enchey Monastery. After completing the local sightseeing, start your journey towards Darjeeling. Enjoy the scenic drive through the winding roads, lush tea gardens, and mesmerizing Himalayan views. Upon arrival in Darjeeling, check in to your hotel and relax for the evening at leisure.	\N	t	\N
7764a20b-f9ea-4e1c-a405-dba106973df1	Lachung – Yumthang Valley Excursion – Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	\r\nAfter an early breakfast, proceed for a full-day excursion to the enchanting Yumthang Valley, also known as the Valley of Flowers. Located at an altitude of around 11,800 feet, this valley is a paradise of rhododendrons and snow-capped peaks. Spend some time amidst the serene beauty of nature and enjoy the breathtaking landscapes.\r\n\r\nYou may also opt for an excursion to the Zero Point (Yumesamdong), situated at an altitude of about 15,300 feet, where the road ends and the snow begins — a mesmerizing experience for adventure lovers. Alternatively, you can visit Mt. Katao (subject to permit and availability), known for its panoramic Himalayan views and snow-covered terrain.\r\n\r\nAfter completing the sightseeing, return to Lachung for lunch, then drive back to Gangtok. Enjoy the scenic descent through mountain streams and valleys. On arrival in Gangtok, check in to your hotel for an overnight stay.	\N	t	\N
5c01d2cf-1ae9-4730-ae9f-fb9e5a6fe0c9	Pelling to Darjeeling and Half-Day Sightseeing 	3134f29d-8635-411f-a6dd-c2562eb7314d	After breakfast, check out from your hotel in Pelling and proceed towards Darjeeling. The journey takes you through scenic mountain roads, lush green valleys, and beautiful tea gardens offering a mesmerizing view of the Eastern Himalayas. Upon arrival in Darjeeling, check in to your hotel and relax for a while.\r\n\r\nIn the afternoon, begin your half-day sightseeing tour of Darjeeling, covering some of the most popular attractions of the hill town. Visit the Darjeeling Himalayan Railway Station (Toy Train Station), a UNESCO World Heritage Site, followed by the Padmaja Naidu Himalayan Zoological Park (home to the rare red panda and snow leopard). Continue to the Himalayan Mountaineering Institute, showcasing the rich mountaineering history of the region. Later, explore the Tenzing Rock and Tibetan Refugee Self Help Centre, where you can witness traditional handicraft making.\r\n\r\nAfter sightseeing, return to your hotel. The evening is free for leisure — you may take a walk along Mall Road and explore the local markets for souvenirs. Dinner and overnight stay at the hotel in Darjeeling.	\N	t	\N
efa7fbeb-f886-42c4-8228-158bf64c0d1e	Mirik & Pasupati Market Excursion from Darjeeling (Full-Day Itinerary)	3134f29d-8635-411f-a6dd-c2562eb7314d	\r\nAfter breakfast, proceed for a full-day excursion to Mirik Lake and Pasupati Market, located near the Indo-Nepal border. Enjoy a scenic drive through lush tea gardens and pine forests, offering stunning views of the rolling hills and valleys.\r\n\r\nUpon reaching Mirik, visit the beautiful Sumendu Lake, where you can enjoy boating and walk across the arch footbridge connecting the lake’s banks. The peaceful surroundings and the reflection of the mountains on the lake make it a perfect spot for photography and relaxation.\r\n\r\nNext, visit the Pasupati Market, a lively cross-border market in Nepal, famous for imported clothes, cosmetics, and electronic goods. Please remember to carry a valid ID proof, as the market lies close to the Indo-Nepal border (entry may depend on local regulations).\r\n\r\nAfter exploring the market and enjoying some local snacks, drive back to Darjeeling in the evening. On arrival, spend the evening at leisure or stroll around Mall Road for shopping.\r\n\r\nOvernight stay in Darjeeling.	\N	t	\N
ed076cf0-8f9e-487f-aff3-ffb96bd830fc	Darjeeling – Tiger Hill, Ghoom Monastery & Batasia Loop – NJP/Bagdogra Departure	3134f29d-8635-411f-a6dd-c2562eb7314d	Early in the morning, around 4:00 AM, proceed for an unforgettable sunrise trip to Tiger Hill. Witness the magnificent view of the first rays of the sun illuminating the snow-capped peaks of Mt. Kanchenjunga and, on clear days, even the distant Mt. Everest. After enjoying the breathtaking sunrise, visit the historic Ghoom Monastery, one of Darjeeling’s oldest monasteries, housing a beautiful statue of Maitreya Buddha and ancient Tibetan scriptures. On your way back, stop at the Batasia Loop, a unique spiral railway track surrounded by lush gardens and offering panoramic views of Darjeeling town and the Himalayan range, along with the iconic war memorial dedicated to Gorkha soldiers.\r\n\r\nReturn to the hotel for a short rest. Later, check out from your hotel and proceed towards NJP Railway Station or Bagdogra Airport for your onward journey. Carry with you beautiful memories of the hills, tea gardens, and serene landscapes of Darjeeling, marking the end of a refreshing and memorable trip.	\N	t	\N
87c1abbf-ec73-482c-93f4-8cf2a7d0d488	Gangtok to Darjeeling and Darjeeling Half Day Local Sightseen	3134f29d-8635-411f-a6dd-c2562eb7314d	After breakfast, check out from your hotel in Gangtok and begin your scenic drive to Darjeeling. The journey takes around 4 to 5 hours, passing through picturesque valleys, lush tea gardens, and winding mountain roads. En route, enjoy the changing landscapes as you descend from Gangtok’s serene hills to Darjeeling’s colonial charm. Upon arrival, check in to your hotel and take some time to relax.\r\n\r\nIn the afternoon, proceed for a half-day sightseeing tour of Darjeeling. Visit the Padmaja Naidu Himalayan Zoological Park, home to rare species like the red panda and snow leopard, and the Himalayan Mountaineering Institute, which preserves the legacy of Tenzing Norgay. Next, explore the Tibetan Refugee Self-Help Centre, known for its beautiful handicrafts, and stroll through the Darjeeling tea gardens, where you can witness tea processing and enjoy the refreshing aroma of freshly plucked leaves. End your day with a visit to Chowrasta Mall Road, where you can shop for souvenirs and enjoy the charming mountain ambience before returning to your hotel for an overnight stay.	\N	t	\N
6bf8a3f8-5e26-4cb4-9481-63e435e09060	NJP/Airport to Darjeeling Arrival 	3134f29d-8635-411f-a6dd-c2562eb7314d	Upon arrival at New Jalpaiguri Railway Station (NJP), you will be greeted by our representative and begin your scenic drive to Darjeeling, one of the most enchanting hill stations in India, located at an altitude of 6,710 feet. The journey takes around 3 to 4 hours, passing through lush green tea gardens, winding mountain roads, and charming hillside villages. On arrival, check in to your hotel and relax after the journey. The rest of the evening is free for leisure — you may take a stroll around Mall Road or explore the local market for some authentic Darjeeling tea and souvenirs.\r\n\r\nOvernight stay at the hotel in Darjeeling.	\N	t	\N
d5d40dad-0372-473b-a435-a6b1c5741290	Pelling to NJP / IXB Airport Drop	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	\N	t	\N
30f58617-07c8-43f5-a60c-fa73e723fafb	Gangtok to Pelling Via Namchi	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	\N	t	\N
186e7abe-be80-40b7-884e-9e78983dfc16	Gangtok to Pelling Via Ravangla 	699dcf21-0624-48a9-a1fe-c21db084d708	Start Day with a heavy breakfast as this day awaits travelling and sightseeing umpteen. On your journey to Pelling you will come across various sightseeing destinations of Ravangla.Our representatives will pick you up from the hotel in the morning and drive you to Pelling. Pelling is a tiny hamlet town in west Sikkim. On your way to Pelling,   After some time here, you will head to Ravangla. Here, you can spend time sightseeing the popular Buddha Park and Temi Tea Gardens. Ravangla offers a scenic view of the Greater Himalayas. Once that’s done, you will arrive at your hotel in Pelling. Enjoy a hearty meal and take a goodnight rest as you look forward to what tomorrow has in store.	\N	t	\N
3413d7ee-696b-48df-9bc5-247dd1e72c8e	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	\N	t	\N
7e3d6c27-e59b-44d2-a3ff-afafb3645a93	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	\N	t	\N
e3b123fe-0b1f-4d74-82f4-04dd18114820	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	\N	t	\N
af9a2d9d-b01f-4ffa-848f-8eef4163bf11	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	\N	t	\N
8cb87ece-1965-46ff-946e-0d64aadf2c1e	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	\N	t	\N
3fb0a53f-3c1a-4345-915b-cbb91503c2d7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	\N	t	\N
e4487f80-260f-4364-beec-d1be3f7cf57e	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	\N	t	\N
3604b389-5e19-4ade-b37c-5659853b896d	Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) To Aritar	429c09c0-d14a-4a9a-9f06-7b43981e5e13	 Guest will be received by our official at Pakyong Airport (PYG) nearly 30 kilometers from Gangtok Or Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) / Tenzing Norgay Bus Terminus (Junction) – He will assist you for the forwarding journey to Aritar / Lingsey – From Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) is at a distance of 110 kilometers aqnd is nearly 04 - 05 hours drive by road - Aritar in East Sikkim district of the Indian state of Sikkim is known for its natural and landscaped beauty  - Known for lush forest, mountains and rivers - The Aritar Lake (Ghati-Tso) is a nearby attraction, as are traditional villages and monasteries such as Lingsay - Lingsey is nearly 110 kilometers from Siliguri anfd is at an altitude of  4800 feet - Check into Hotel  / Home Stay - Back to Rongli for permit - Night stay at Lingsey or Aritar	\N	t	\N
2b322472-3096-4d1c-8030-ee1e094ebb63	ARITAR TO ZULUK TOUR	051f9729-4b94-4aaf-8811-29de0c2eb244	 After breakfast, start for Zuluk Tour via Rongli Dam, Lingtam, Lingtam Monastery, Keukhela Falls, and finally reach zuluk.\r\n\r\nRongli [Altitude: 5200 ft.] - Rongli is an east Sikkim small township located on the bank of river Rongli. The inner line permit for visit towards Nathula granted over there.\r\n\r\nRongli Dam - The Rongli dam is a concrete dam on the Rongli river with a height of 41m and can hold 45,200 cubic meters of water.\r\n\r\nLingtam [Altitude 5082 ft.] - Lingtam is a small village next after the Rongli permit zone at an altitude of 5000 feet from sea level. It's known for his sun kissed peaceful weather surrounded by the hills of all it four sides. You can visit Lingtam Monestry also.\r\n\r\nKeukhela Falls - The Keukhela falls or Kali Khola falls located on the way of the old silk route in between Lingtam and Padamchen. This fall is 100m in heights and beautifully surrounded by scenic nature. Reach zuluk before lunch.\r\n\r\nZuluk [Altitude: 7000 ft.] - A small village in East Sikkim, part of Old Silk Route 10000 ft. above the sea level gaining popularity amongst the tourists because of its natural virginity, unspoiled nature and amazing Himalayan beauty. Catching a glimpse of the snow capped mountain ranges or sun rising on the sea from the window of the hotel room is something that you might have experienced a lot of times. Overnight stay at Zuluk Homestay	\N	t	\N
a76fc0d7-0e2d-4174-9f2d-4c9b0e601256	Zuluk Sightseeing – Tsomgo Lake – Baba Mandir 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	After an early breakfast, proceed for Zuluk sightseeing, covering Thambi View Point, Lungthung View Point, Zig-Zag Road, and Kupup Lake . Later, drive towards Tsomgo (Changu) Lake to admire its serene beauty, followed by a visit to Baba Harbhajan Singh Mandir. Nathula Pass can be visited on this day subject to permit availability and weather conditions (optional and at extra cost). After sightseeing, continue your drive to Gangtok. On arrival, check in to the hotel and enjoy an overnight stay at Gangtok.	\N	t	\N
fcac98fe-764e-4936-9a7a-a8c21081a5eb	Full Day Local Sightseeing in Pelling	699dcf21-0624-48a9-a1fe-c21db084d708	Give this day an early start with some toothsome breakfast and prepare for local sightseeing in Pelling.\r\n\r\nFirst, head to the Darap Valley. This little hamlet is a perfect picnic spot where you can interact with the locals and take a glimpse into the Sikkimese lifestyle. The local villagers are very warm and friendly and you will enjoy your time spending it in their embrace.\r\n\r\nNext, visit the Rimbi waterfalls and the Kanchenjunga waterfalls. These perennial waterfalls provide refreshment to the mind, body and soul and are one of the major tourist attractions of the town. It is also a major spot for recreational activities like fishing.\r\n\r\nThen, move ahead and visit the Rock Garden and the Khecheopalri Lake. The Rock Garden is studded with gardens and pools and a small stream runs within it. You must take a walk on its meandering footpaths.\r\n\r\nThe Khecheopalri Lake, on another hand, is presumed to be one of the most sacred lakes in Pelling. It is placid, picturesque and a clean water body with no leaves floating over even though it is set amidst a thick bushy forest.\r\n\r\nLastly, visit the Rabdentse Ruins, Pema Yangtse monastery and Helipad Ground. The Rabdentse ruins speak volumes about Sikkim’s glorious past. It is a must see site for archaeological and history lovers.\r\n\r\nThe Pema Yangtse is at a walking distance from here and offers splendid views of the Kanchenjunga ranges. The Helipad ground is also another popular viewing spot to behold the splendid views of the snow-capped ranges. The view of the sunset here is like something you must have never witnessed.\r\n\r\nReturn to the hotel in the evening and stay overnight in Pelling.	\N	t	\N
9d018a5e-b1c6-4a9a-b2b5-91d386048d69	Gangtok- (Full Day Local Sight Seeing)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today, it’s all about Gangtok and its awe-inspiring sights.\r\nBakthang Waterfall\r\nAt the distance of 3 km from Gangtok, Bakthang Waterfall will be your first stop which is an eye-catching attraction that no tourist ever want to miss. Flowing from Ratey Chu, it is a broad waterfall that creates a soothing environment for the visitors to enjoy.\r\nTashi Viewpoint\r\nSubsequently, you can observe the glorious Himalayas from Tashi Viewpoint that will be your binocular to scrutinise the seeking view of snow peaks. Moreover, keep your camera’s panoramic setting on because this is the right spot to capture the entire beauteous landscape.\r\nGanesh Tok\r\nJust wish that it’s a clear day because it’s only on the bright clear days that you can have the most awesome view of the place. Apart from Tashi View Point, Ganesh Tok is the place from where you can have a spectacular view of Gangtok. It is an ancient temple of Lord Ganesha that has a pleasant aura. This place welcomes you through its brilliant entrance, and as you swirl the sights, you will see colourful buntings surrounding the temple.\r\nEnchey Monastery\r\nYour next destination of the day is a 200 years old monastery which was initially established as a small gompa by a tantric artist and renowned exponent among highlander Buddhists, Lama DrupthobKarpo. Enchey Monastery literally means “the Solitary Temple” which now is home to almost 90 monks. Tourists are quite fascinated by the place because it accommodates a number of religious objects and presents Tibetan culture in a beguiling manner.\r\nDirectorate of Handicraft and Handloom\r\nNow, it is time for you to admire the local art and talent depicted through the Handicrafts in this Directorate which is located at the ‘Zero’ point of the city. Here you can buy the majestic artefacts such as Thanka painting, traditional carpets, wooden carved and colourfully painted sculptures and much more. Do DrulChorten Stupa\r\nStanding proudly on the hill Hock, Do DrulChorten, also known as Phurba, is your next station which is also the biggest stupa of Sikkim. This shrine was constructed in 1945 and is encircled with 108 prayer wheels from which visitors gain divine blessings.\r\nInstitute of Tibetology\r\nAfter your spiritual tour, it is time for you to grasp some cultural and educative values of Tibet. One of the most significant institutions of the world, the Institute of Tibetology is that centre where many scholars research on the Tibetan language and tradition. Furthermore, you can know more about Life-at-Tibet through valuable material kept in the museum and Tibetan library that has preserved innumerable rich collections of the studies.\r\nFlower Show\r\nAs an integral part of aesthetic festivity, the locals of Gangtok organise a celebration in the name of Sikkim’s diverse vegetation. The flower show is the International Flower Festival which is celebrated every peak season of blooming. In the fete, the perfect blend of Gangtok’s topography is mirrored when breathtaking blossoms are showcased at a place from every corner of Sikkim. This is a must-visit and stupendous moment for every nature lover. \r\nRopeway & Banjhakri Falls\r\nLast but not the least, you will be enthralled by the bounteous attractiveness of the place when you will travel through Ropeway to reach Banjhakri Falls which is 70 ft tall waterfall surrounded by lush greenery of dense forest. This waterfall ascribes the natives because of their belief that it has all the healing and magical power like any other sacred place.After a busy and most memorable day of your trip, you will be taken back to your hotel where you can enjoy hot and appetising dinner. Spend overnight in your warm room because tomorrow you will visit some more astounding places.	\N	t	\N
\.


--
-- TOC entry 4281 (class 0 OID 17149)
-- Dependencies: 257
-- Data for Name: destination_cms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destination_cms (id, destination_id, about_html, hero_image, gallery_images, seo_title, seo_desc, is_published) FROM stdin;
\.


--
-- TOC entry 4253 (class 0 OID 16526)
-- Dependencies: 229
-- Data for Name: destinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destinations (id, name, country, description, is_active) FROM stdin;
c32d5d30-f52a-4283-ba0f-d1834e3394c5	Lachung	\N	\N	t
8d90dd28-96a4-4799-a0f8-e4639dc823e8	Ravangla	\N	\N	t
3134f29d-8635-411f-a6dd-c2562eb7314d	Darjeeling	\N	\N	t
1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Gangtok		Eastern Himalayas at an elevation of 1,650 meters. Known as a major Buddhist center and tourist destination, it offers scenic views of Mount Kanchenjunga, vibrant markets like MG Marg, and attractions like the Nathula Pass, Enchey Monastery, and Himalayan Zoological Park	t
699dcf21-0624-48a9-a1fe-c21db084d708	Pelling	\N	\N	t
4dfa39c3-634b-49b9-a043-3cf3403e63bf	Lachen	\N	\N	t
051f9729-4b94-4aaf-8811-29de0c2eb244	Zuluk	India	\N	t
429c09c0-d14a-4a9a-9f06-7b43981e5e13	Aritar	India	\N	t
\.


--
-- TOC entry 4275 (class 0 OID 17046)
-- Dependencies: 251
-- Data for Name: email_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_logs (id, query_id, template_id, subject, body, sent_by, sent_at, status, communication_type, cc, error_msg, "to") FROM stdin;
\.


--
-- TOC entry 4265 (class 0 OID 16886)
-- Dependencies: 241
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_templates (id, name, subject, body_rich_text, is_active, created_at) FROM stdin;
\.


--
-- TOC entry 4283 (class 0 OID 17177)
-- Dependencies: 259
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, amount, category, vendor, description, expense_date, receipt_url, recorded_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4279 (class 0 OID 17120)
-- Dependencies: 255
-- Data for Name: gallery_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gallery_images (id, image_url, caption, category, sequence, is_active) FROM stdin;
7b1cffb1-5647-4e8b-a317-615583b384de	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775190080/travelcrm/gallery/ynfildudeak04xhvj2sg.jpg	1000_F_290456712_DMwh185Zu3uiCXPLWPjapsoI7n9ZNlEQ	General	0	t
53456a15-f50f-4895-91d1-f162e58b31de	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	 Gangtok photo	General	0	t
64d7ff2a-0fe5-42a3-a7ae-5b679666e6d1	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg	Tsomgo Lake Photo	General	0	t
0d365663-6fea-4802-9de9-f8439dc96610	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	pelling photo	General	0	t
61f9082b-ba28-4b3c-bf40-517d44eb362e	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	sky walk pelling	General	0	t
ead090ec-fa4b-41c7-80db-4a783409e1e4	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	pelling road	General	0	t
f3668206-997d-453f-9efe-eb092526f9fc	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278879/travelcrm/gallery/yrm8jxruvmkmxjsxll4f.jpg	car1	General	0	t
a11c5eb4-f804-4635-b55e-4e0d72c258a0	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279137/travelcrm/gallery/q6pohdpra3wqit53qq51.webp	HOTEL	General	0	t
730c857d-13bf-476b-96aa-2c9630b94c79	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279417/travelcrm/gallery/pnnsz8akm5d13a5ojetc.jpg	HOTEL1	General	0	t
fd0a090c-311f-467e-b542-fbc42f45dbd8	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775751601/travelcrm/gallery/tm5vtag0blw4pbdxrypc.jpg	anil-jose-xavier-Tp-kViKErbw-unsplash	General	0	t
affde851-6643-4619-8363-d7d7003910fe	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775819570/crm-masters/galleryImages/wk3dr8qmnweakli2n8la.jpg	Travel	\N	0	t
188ace60-d3b9-4bde-b424-132e00b3d7bd	https://res.cloudinary.com/duxmcwrh3/image/upload/v1776065268/travelcrm/gallery/jzxb4qxfq8cgkvgdgdo3.jpg	niloy-banerjee-w2uhp5VrF8M-unsplash	General	0	t
f1781e44-85d0-496d-bc38-ee0875e2f48a	https://res.cloudinary.com/duxmcwrh3/image/upload/v1776084560/travelcrm/gallery/crcx1ujmc9re3grgpup1.jpg	avinash-kumar-vDempbPR52w-unsplash	General	0	t
\.


--
-- TOC entry 4277 (class 0 OID 17093)
-- Dependencies: 253
-- Data for Name: home_banners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.home_banners (id, image_url, title, subtitle, link_url, sequence, is_active) FROM stdin;
\.


--
-- TOC entry 4254 (class 0 OID 16537)
-- Dependencies: 230
-- Data for Name: hotels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hotels (id, destination_id, name, category, base_price, is_active, image_url) FROM stdin;
cf9b15fe-cb9c-4c02-b14d-fa7d2b374d34	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Sai Residency	3 STAR	500.00	t	\N
f30630f0-93f8-4a3d-b3bf-1734e07a6514	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Hotel Potala	3 star	500.00	t	\N
\.


--
-- TOC entry 4262 (class 0 OID 16658)
-- Dependencies: 238
-- Data for Name: integration_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integration_logs (id, type, direction, status, payload, error_message, related_id, created_at) FROM stdin;
c5dc7b91-6c4e-4129-80b0-0a45ade1dd65	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	e8691925-5f18-48a2-8836-5a9da4fe8573	2026-03-20 19:35:22.838
d0df6e48-329e-455c-a943-8f3b4f16a4df	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	e8691925-5f18-48a2-8836-5a9da4fe8573	2026-03-20 22:25:45.847
7950431e-1e28-4bca-a572-1efe2e3b89a3	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	60bcf2de-9478-48ae-94e0-49fc16020427	2026-03-20 23:18:09.599
bd97a6df-d7bc-4623-b56a-40c4e5831e9c	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	60bcf2de-9478-48ae-94e0-49fc16020427	2026-03-20 23:26:52.901
c4ce25c3-66d9-4b84-9207-ddbb09de0908	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	60bcf2de-9478-48ae-94e0-49fc16020427	2026-03-21 08:54:03.663
350e139e-b0e2-4692-bed6-34c07783d3e9	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	60bcf2de-9478-48ae-94e0-49fc16020427	2026-03-21 12:59:35.926
7c1db876-04a0-4721-b498-5d0ddea24a75	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal is Ready!", "provider": "brevo_smtp"}	\N	60bcf2de-9478-48ae-94e0-49fc16020427	2026-03-21 20:39:47.711
ea206ae0-0e1b-4efd-bfbe-54961fdb77bf	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal is Ready!", "provider": "brevo_smtp"}	\N	60bcf2de-9478-48ae-94e0-49fc16020427	2026-03-21 20:39:48.681
49608c89-224c-419c-a223-b061e3b704a3	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal is Ready!", "provider": "brevo_smtp"}	\N	60bcf2de-9478-48ae-94e0-49fc16020427	2026-03-21 20:39:49.638
11d8890e-4850-40b5-8b38-a0ec474f7a5f	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal is Ready!", "provider": "brevo_smtp"}	\N	60bcf2de-9478-48ae-94e0-49fc16020427	2026-03-21 20:39:50.546
1537cb5a-3fba-42e5-b9a1-6d6c14d658cd	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal is Ready!", "provider": "brevo_smtp"}	\N	60bcf2de-9478-48ae-94e0-49fc16020427	2026-03-21 20:39:51.426
89799dd1-0e92-4550-9a10-58c40289b1b4	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - Richard", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	60bcf2de-9478-48ae-94e0-49fc16020427	2026-03-21 20:44:55.917
c700bf1f-de0a-458f-9160-b179a508b509	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your TravelCRM Password Has Been Reset", "provider": "brevo_smtp"}	\N	\N	2026-03-21 21:16:34.081
6ec2fbf1-09bb-4403-8f3f-fe8a7de3d37e	email	outbound	success	{"to": "anandharsh437@gmail.com", "subject": "Your Travel Proposal - prince ", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	630d27a2-f961-4958-b554-2c08d3a05c20	2026-03-24 19:03:39.98
65514ebb-f3a7-4a35-b032-8ddfd821bbe0	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - SAMAR ANAND", "provider": "brevo_smtp", "withCustomAttachment": true}	\N	c3e98583-a729-4f2a-985f-53f0588966ce	2026-03-25 14:34:50.437
579c7ab9-5317-4301-933e-9d70db4fd22b	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	630d27a2-f961-4958-b554-2c08d3a05c20	2026-04-01 16:55:52.76
8294c2cc-db0f-499e-af2c-c9eaa29957c2	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	630d27a2-f961-4958-b554-2c08d3a05c20	2026-04-01 17:04:57.943
17a01dd0-a1d0-4faf-8cb3-917f44897a79	email	outbound	success	{"to": "anandharsh437@gmail.com", "subject": "Your Travel Proposal - prince ", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	630d27a2-f961-4958-b554-2c08d3a05c20	2026-04-01 17:18:32.495
b677e5e4-5c5f-4bb2-bb7a-bc72d1558c4d	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	55af5810-88a6-4291-b2ed-3b44d8da3ea8	2026-04-02 23:32:26.766
1bb94679-c30c-4442-ac42-ae2cc1999ca5	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - KUMAR HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	56f43237-675f-4a9a-80ad-f3be1b7d8962	2026-04-03 13:52:11.534
3ce5043f-0c8b-41a1-bda5-cf708e5ef8e8	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - KUMAR HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	56f43237-675f-4a9a-80ad-f3be1b7d8962	2026-04-03 13:53:33.186
08405b56-0e07-4342-9fc6-6f9a54e25f03	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - KUMAR HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	56f43237-675f-4a9a-80ad-f3be1b7d8962	2026-04-04 01:10:07.771
91a55258-1d86-440f-ba2b-fc409929bad3	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - KUMAR HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	56f43237-675f-4a9a-80ad-f3be1b7d8962	2026-04-04 04:45:33.642
11114f39-09e6-4d68-b05c-de3ba6ff7e80	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - KUMAR HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	56f43237-675f-4a9a-80ad-f3be1b7d8962	2026-04-04 04:57:51.75
c29ff9ce-78be-4a23-9fcc-3cc9a0a69d94	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - KUMAR HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	56f43237-675f-4a9a-80ad-f3be1b7d8962	2026-04-04 05:36:56.33
7a9901a4-d52b-455e-85df-e30089ffed84	email	outbound	success	{"to": "anandharsh437@gmail.com", "subject": "Your Travel Proposal - HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	e403e125-595c-4df5-83ab-a6724e05988a	2026-04-04 16:26:37.225
6ac0815c-8c63-4bfe-bd87-377c3473e6be	email	outbound	success	{"to": "anandharsh437@gmail.com", "subject": "Your Travel Proposal - HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	e403e125-595c-4df5-83ab-a6724e05988a	2026-04-04 17:17:43.298
66a808eb-8c56-40e6-8aa2-23739c543867	email	outbound	success	{"to": "amansharma199502@gmail.com", "subject": "Your Travel Proposal - rahul", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	777c632b-52b7-46d3-9bf8-fb3e591b372f	2026-04-04 17:25:55.915
d234587c-22f3-443e-87f7-790b6525295f	email	outbound	success	{"to": "anandharsh437@gmail.com", "subject": "Your Travel Proposal - HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	e403e125-595c-4df5-83ab-a6724e05988a	2026-04-05 15:04:19.684
f790dbff-e011-4f8c-a755-9fe5cf9be6fd	email	outbound	success	{"to": "anandharsh437@gmail.com", "subject": "Your Travel Proposal - HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	e403e125-595c-4df5-83ab-a6724e05988a	2026-04-05 15:12:36.452
6b761c71-d81f-4104-92e7-5743abfb2cf4	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - jasi", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	2eda62ee-c966-42c9-a264-87acc98c0482	2026-04-05 15:15:00.236
c3ad6ff3-305b-413b-a2bd-5dca3c10de17	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	2eda62ee-c966-42c9-a264-87acc98c0482	2026-04-05 15:15:02.645
bb86f34d-fd40-4e74-b016-3616ec8e95bc	email	outbound	success	{"to": "anandharsh437@gmail.com", "subject": "Your Travel Proposal - HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	e403e125-595c-4df5-83ab-a6724e05988a	2026-04-05 15:19:32.157
587a49e9-deed-4fee-9769-ff960cf18fc6	email	outbound	success	{"to": "anandharsh437@gmail.com", "subject": "Your Travel Proposal - HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	e403e125-595c-4df5-83ab-a6724e05988a	2026-04-05 20:15:39.978
d3797684-a381-478a-95e0-a2c99357850b	email	outbound	success	{"to": "anandharsh437@gmail.com", "subject": "Your Travel Proposal - HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	e403e125-595c-4df5-83ab-a6724e05988a	2026-04-06 00:50:11.935
266c6e02-e17d-4bc2-a84d-a98d8754deb7	email	outbound	success	{"to": "amansharma199502@gmail.com", "subject": "Your Travel Proposal - rahul", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	777c632b-52b7-46d3-9bf8-fb3e591b372f	2026-04-06 01:11:03.765
125714a9-9f11-4735-8215-6b8c86ac522c	email	outbound	success	{"to": "jionor84@gmail.com", "subject": "Your Travel Proposal - leo", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	495b81c2-268c-478c-b85c-02228b52bad5	2026-04-09 08:19:02.817
6a61911b-7a3e-4e95-a9c5-5ec61a92318d	email	outbound	success	{"to": "jionor84@gmail.com", "subject": "Your Travel Proposal - leo", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	495b81c2-268c-478c-b85c-02228b52bad5	2026-04-09 11:52:30.657
3c83b61a-9df0-434d-8012-c48271825993	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - Richard", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	2026-04-10 04:41:22.653
4ba9fa4b-5279-4cd5-9554-5223a7e87410	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - Richard", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	2026-04-10 07:55:21.251
1aec0724-99d3-4e87-b5d3-c3872b83087b	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - Richard", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	2026-04-10 10:36:10.508
2500472d-91d3-4132-9323-d45aa6cd76b6	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - Richard", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	2026-04-10 10:54:25.017
3d811507-5b13-44b2-9adb-b9c8f98eaae0	email	outbound	success	{"to": "harshbuddy01@gmail.com", "subject": "Your Travel Proposal - Richard", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	2026-04-10 11:06:17.959
7e39bce8-69cf-49eb-ba3f-d904710ed312	email	outbound	success	{"to": "anandharsh437@gmail.com", "subject": "Your Travel Proposal - KUMAR HARSH ANAND", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	ff3f5da9-0d48-4cd4-b70b-709c2d121ee2	2026-04-10 11:21:38.87
468499d7-7efa-4233-99db-e2912352fe35	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	ff3f5da9-0d48-4cd4-b70b-709c2d121ee2	2026-04-13 15:55:39.064
87bd2d4d-0cab-4f48-b548-04fab35099a8	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	2026-04-13 15:56:03.12
266f66ab-9249-4b8a-a780-1be122ece588	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	f2fe6c8b-55ef-467b-b592-8dddfd1ca908	2026-04-13 15:57:21.437
7bc4a780-1314-4a31-a601-8716f4f4ee98	email	outbound	success	{"to": "anujgawde750@gmail.com", "subject": "Your Travel Proposal - Anuj Gawade", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	f4b8679e-75f2-42da-846e-0a697c9958eb	2026-04-17 10:29:48.831
9cc5038d-2d11-4866-9903-e5fc7f2156d8	tracking	inbound	success	{"event": "whatsapp_opened"}	\N	f4b8679e-75f2-42da-846e-0a697c9958eb	2026-04-17 10:32:53.79
9a2a1cc8-60cb-4f34-96a5-c7876d9e5b7f	email	outbound	success	{"to": "bekar@thickwire.in", "subject": "Your Travel Proposal - Samar ", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	2c8ad043-4e77-40a7-9b7f-26dc6b39b4b3	2026-04-21 07:38:30.732
7d0084ff-9eb8-4d10-9b20-3870a9168bd6	email	outbound	success	{"to": "bekar@thickwire.in", "subject": "Your Travel Proposal - Samar ", "provider": "brevo_smtp", "withCustomAttachment": false}	\N	2c8ad043-4e77-40a7-9b7f-26dc6b39b4b3	2026-04-21 10:37:06.394
\.


--
-- TOC entry 4284 (class 0 OID 17192)
-- Dependencies: 260
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, invoice_number, query_id, tour_id, client_name, client_email, client_phone, client_address, items, subtotal, tax_percent, tax_amount, total_amount, pdf_url, status, sent_at, paid_at, due_date, notes, created_by, created_at, updated_at, deleted_at) FROM stdin;
5b3a6bb8-8a7e-4a3b-bab9-7fcacf4eb4d9	INV-2026-001	e403e125-595c-4df5-83ab-a6724e05988a	\N	HARSH ANAND	anandharsh437@gmail.com	+917004283531	\N	[{"amount": 12000, "quantity": 1, "unitPrice": 12000, "description": "Tour Package"}]	12000.00	0.00	0.00	12000.00	\N	draft	\N	\N	2026-04-10	\N	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-10 02:14:09.293	2026-04-10 02:14:09.293	\N
\.


--
-- TOC entry 4291 (class 0 OID 25818)
-- Dependencies: 267
-- Data for Name: itineraries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.itineraries (id, title, description, cover_photo_url, share_slug, status, total_cost, per_person_cost, currency, adults, children, markup_pct, created_by, deleted_at, created_at, updated_at, terms_html, cancellation_policy_html, exclusions_html, inclusions_html, payment_policy_html, nights, costing_breakdown, selling_price, is_template, source_template_id, travel_date_from, travel_date_to) FROM stdin;
92999748-1a5e-4237-814a-e431534e1aa3	Gangtok Lachen Lachung Tour (Copy)	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-03 00:37:38.623	2026-04-03 00:37:33.203	2026-04-03 00:37:38.624	f you Cancel your Holiday\nYou or any member of your party may cancel their travel arrangements at any time. Written notification or an e-mail to that effect from the person who made the booking must be received at our office. The cancellation charges applicable are as per the published cancellation policy below :\n\nIf we change or cancel your holiday\n\nWe do plan the arrangements in advance. It is unlikely that we will have to make any changes to your travel arrangements.\nOccasionally, we may have to make changes and we reserve the right to do so at any time. If there are any changes, we will advise you of them at the earliest possible date.\nWe also reserve the right under any circumstances to cancel your travel arrangements by assigning reasons to you.\nIf we are unable to provide the booked travel arrangements due to reasons beyond our control (e.g. bad weather):We shall first try to offer alternative dates for the tour if the tour hasn't already commenced.\nIf the tour has already commenced, then we shall refund the booking price/fee charged to you on a pro-rata basis depending on the portion of the tour utilized by you.\nIn all circumstances, however, our liability shall be limited to refunding to you the price we charged as tour fees.\nIf you want to change your holiday plan\nAfter confirmation of services, if you wish to change your travel arrangements in any way (e.g. your chosen departure date or accommodation), we will do our utmost to make these changes but it may not always be possible. Any request for changes must be in writing from the person who made the booking. All cost incurred due to amendment will be borne by you.\n\nIf you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\n\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	\N	\N	\N	f	\N	\N	\N
80b8e518-e306-4a15-a6a5-d06fbf2ddedc	.....	\N	\N	\N	draft	\N	\N	INR	2	0	\N	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-13 05:36:50.324	2026-04-13 05:35:56.179	2026-04-13 05:36:50.325	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	\N	\N
89f8cd1c-c07b-4974-ada6-c5b193da8a97	Gangtok Lachen Lachung Tour (Copy)	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-03 00:47:41.876	2026-04-03 00:38:00.263	2026-04-03 00:47:41.877	f you Cancel your Holiday\nYou or any member of your party may cancel their travel arrangements at any time. Written notification or an e-mail to that effect from the person who made the booking must be received at our office. The cancellation charges applicable are as per the published cancellation policy below :\n\nIf we change or cancel your holiday\n\nWe do plan the arrangements in advance. It is unlikely that we will have to make any changes to your travel arrangements.\nOccasionally, we may have to make changes and we reserve the right to do so at any time. If there are any changes, we will advise you of them at the earliest possible date.\nWe also reserve the right under any circumstances to cancel your travel arrangements by assigning reasons to you.\nIf we are unable to provide the booked travel arrangements due to reasons beyond our control (e.g. bad weather):We shall first try to offer alternative dates for the tour if the tour hasn't already commenced.\nIf the tour has already commenced, then we shall refund the booking price/fee charged to you on a pro-rata basis depending on the portion of the tour utilized by you.\nIn all circumstances, however, our liability shall be limited to refunding to you the price we charged as tour fees.\nIf you want to change your holiday plan\nAfter confirmation of services, if you wish to change your travel arrangements in any way (e.g. your chosen departure date or accommodation), we will do our utmost to make these changes but it may not always be possible. Any request for changes must be in writing from the person who made the booking. All cost incurred due to amendment will be borne by you.\n\nIf you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\n\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	\N	\N	\N	f	\N	\N	\N
1764f996-b3fd-4814-b01f-d090ea694ef6	Gangtok Lachen Lachung Tour (Copy)	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-03 00:47:43.903	2026-04-03 00:38:07.619	2026-04-03 00:47:43.903	f you Cancel your Holiday\nYou or any member of your party may cancel their travel arrangements at any time. Written notification or an e-mail to that effect from the person who made the booking must be received at our office. The cancellation charges applicable are as per the published cancellation policy below :\n\nIf we change or cancel your holiday\n\nWe do plan the arrangements in advance. It is unlikely that we will have to make any changes to your travel arrangements.\nOccasionally, we may have to make changes and we reserve the right to do so at any time. If there are any changes, we will advise you of them at the earliest possible date.\nWe also reserve the right under any circumstances to cancel your travel arrangements by assigning reasons to you.\nIf we are unable to provide the booked travel arrangements due to reasons beyond our control (e.g. bad weather):We shall first try to offer alternative dates for the tour if the tour hasn't already commenced.\nIf the tour has already commenced, then we shall refund the booking price/fee charged to you on a pro-rata basis depending on the portion of the tour utilized by you.\nIn all circumstances, however, our liability shall be limited to refunding to you the price we charged as tour fees.\nIf you want to change your holiday plan\nAfter confirmation of services, if you wish to change your travel arrangements in any way (e.g. your chosen departure date or accommodation), we will do our utmost to make these changes but it may not always be possible. Any request for changes must be in writing from the person who made the booking. All cost incurred due to amendment will be borne by you.\n\nIf you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\n\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	\N	\N	\N	f	\N	\N	\N
56bb8df4-4346-4b2c-8168-a4e4aa6255fe	Gangtok Lachen Lachung Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	KXekfbCTTB1H	published	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	\N	2026-04-01 20:26:30.055	2026-04-04 01:43:30.786	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	\N	\N	t	\N	\N	\N
f8cdf0c6-8f94-4844-8dd7-82952db885f7	Gangtok Lachen Lachung Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1776065268/travelcrm/gallery/jzxb4qxfq8cgkvgdgdo3.jpg	\N	draft	18000.00	6000.00	INR	4	2	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	\N	2026-04-10 11:18:40.282	2026-04-13 12:50:01.465	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	[{"id": "z9w8smd2j", "name": "HOTEL + SERIVES ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	18000.00	f	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	2026-04-18	2026-04-24
e17bcc9c-a96b-4ff0-a403-393c07ea7d8d	Gangtok Lachen Lachung Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	\N	2026-04-17 10:29:24.763	2026-04-17 10:29:24.763	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	\N	\N	f	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	\N	\N
bd43c724-60e0-4f41-a446-22cb5b15856f	Gangtok Lachen Lachung Tour (Copy) (Copy)	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	40000.00	10000.00	INR	4	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-03 00:25:31.672	2026-04-03 00:17:52.764	2026-04-03 00:25:31.673	f you Cancel your Holiday\nYou or any member of your party may cancel their travel arrangements at any time. Written notification or an e-mail to that effect from the person who made the booking must be received at our office. The cancellation charges applicable are as per the published cancellation policy below :\n\nIf we change or cancel your holiday\n\nWe do plan the arrangements in advance. It is unlikely that we will have to make any changes to your travel arrangements.\nOccasionally, we may have to make changes and we reserve the right to do so at any time. If there are any changes, we will advise you of them at the earliest possible date.\nWe also reserve the right under any circumstances to cancel your travel arrangements by assigning reasons to you.\nIf we are unable to provide the booked travel arrangements due to reasons beyond our control (e.g. bad weather):We shall first try to offer alternative dates for the tour if the tour hasn't already commenced.\nIf the tour has already commenced, then we shall refund the booking price/fee charged to you on a pro-rata basis depending on the portion of the tour utilized by you.\nIn all circumstances, however, our liability shall be limited to refunding to you the price we charged as tour fees.\nIf you want to change your holiday plan\nAfter confirmation of services, if you wish to change your travel arrangements in any way (e.g. your chosen departure date or accommodation), we will do our utmost to make these changes but it may not always be possible. Any request for changes must be in writing from the person who made the booking. All cost incurred due to amendment will be borne by you.\n\nIf you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\n\nAll booking vouchers and tickets will be provided 3 days before departure.	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N
79a65650-2922-419f-adb8-dea295dae7e0	Itinerary for Richard	\N	\N	\N	draft	\N	\N	INR	2	0	\N	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-03 00:25:34.553	2026-04-03 00:17:31.994	2026-04-03 00:25:34.554	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N
4972d723-ac4b-4f44-aa65-1070af24a9d0	Gangtok Lachen Lachung Tour (Copy)	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	k64URZoa2CYz	published	40000.00	10000.00	INR	4	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-03 00:37:31.273	2026-04-02 22:57:14.941	2026-04-03 00:37:31.274	f you Cancel your Holiday\nYou or any member of your party may cancel their travel arrangements at any time. Written notification or an e-mail to that effect from the person who made the booking must be received at our office. The cancellation charges applicable are as per the published cancellation policy below :\n\nIf we change or cancel your holiday\n\nWe do plan the arrangements in advance. It is unlikely that we will have to make any changes to your travel arrangements.\nOccasionally, we may have to make changes and we reserve the right to do so at any time. If there are any changes, we will advise you of them at the earliest possible date.\nWe also reserve the right under any circumstances to cancel your travel arrangements by assigning reasons to you.\nIf we are unable to provide the booked travel arrangements due to reasons beyond our control (e.g. bad weather):We shall first try to offer alternative dates for the tour if the tour hasn't already commenced.\nIf the tour has already commenced, then we shall refund the booking price/fee charged to you on a pro-rata basis depending on the portion of the tour utilized by you.\nIn all circumstances, however, our liability shall be limited to refunding to you the price we charged as tour fees.\nIf you want to change your holiday plan\nAfter confirmation of services, if you wish to change your travel arrangements in any way (e.g. your chosen departure date or accommodation), we will do our utmost to make these changes but it may not always be possible. Any request for changes must be in writing from the person who made the booking. All cost incurred due to amendment will be borne by you.\n\nIf you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\n\nAll booking vouchers and tickets will be provided 3 days before departure.	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N
83ebd5c7-bb92-47d8-a976-f73286c2d5ad	Gangtok Lachen Lachung Tour (Copy)	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	10000.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-03 14:30:11.464	2026-04-03 13:38:58.442	2026-04-04 01:43:30.541	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	\N	[{"id": "bjty94jut", "name": "", "type": "Service", "price": 0, "markup": 0, "isPerPerson": false}, {"id": "p1d3j56xv", "name": "day + meel ", "type": "Service", "price": "5000", "markup": 0, "isPerPerson": true}]	10000.00	f	\N	\N	\N
e54911c0-eaeb-4eea-beeb-41f89dd7e434	Gangtok Lachen Lachung Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-21 10:37:13.68	2026-04-21 07:38:03.803	2026-04-21 10:37:13.681	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	\N	\N	f	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	\N	\N
e4b7f9ef-f5d2-4e80-9101-fd0476768b24	Gangtok Lachen Lachung Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-04 01:08:36.129	2026-04-04 01:08:12.071	2026-04-04 01:43:30.541	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	\N	\N	f	\N	\N	\N
6184c7d5-776a-4f9f-a9cb-49bafc8acd15	Gangtok Lachen Lachung Tour (Copy)	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-04 01:08:42.312	2026-04-04 00:46:44.79	2026-04-04 01:43:30.541	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	\N	\N	\N	f	\N	\N	\N
972d8de3-66fe-46e6-ac53-a1fedc5632fc	Gangtok Lachen Lachung Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-04 01:12:34.405	2026-04-04 01:09:12.745	2026-04-04 01:43:30.541	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	\N	\N	f	\N	\N	\N
21deb578-3d51-428c-bb96-b0705a0ee168	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	\N	draft	6000.00	\N	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-21 10:37:35.983	2026-04-21 10:03:31.058	2026-04-21 10:37:35.984	1. Hotel Policies\nStandard Check-in: 12:00 PM, Check-out: 11:00 AM (varies by hotel).\nEarly check-in/late check-out subject to availability & additional charges.\nRoom heaters are chargeable in most hotels.\nNorth Sikkim hotels provide basic amenities due to remote location.\nExtra Bed/Extra Mattress:\nProvided strictly as per hotel policy. Some hotels provide mattresses instead of beds.\nMeals (3-Star Basic Hotels):\nMeal quality and variety are completely dependent on hotel policy (may be simple/homely).\nMeals (Premium Hotels – 3-Star Above):\nMost hotels offer buffet meals, but this is subject to hotel arrangements.\n2. Transportation Terms\nNon-AC vehicles provided (AC not allowed in hilly regions).\nVehicles operate point-to-point as per local union rules.\nSame vehicle may not be allowed for all sightseeing points.\nVehicle will not wait beyond the standard allotted time.\nVehicle replacement due to technical issues will be arranged as per availability without compensation for delays.\n3. Permit & Documentation\nOnly ILP (Inner Line Permit) is included.\nArmy-restricted permits such as Nathula Pass, Zero Point, Kala Patthar, Mt. Katao are not included.\nValid ID proof required: Voter ID / Passport / Driving License.\nAadhaar & PAN are NOT accepted for permits.\nPassport-size photos required.\nIn case of permit closure due to weather/Army restrictions, no refund is applicable.\n4. Unforeseen Circumstances\nSikkim Holidays will not be responsible for delays, skipped sightseeing, or itinerary changes due to:\nWeather issues\nLandslides\nRoadblocks / Strikes\nVehicle breakdowns\nGovernment or Army restrictions\nNatural calamities\nAny condition beyond control\nNo refund or compensation shall be provided in such situations.\n5. Health & Safety\nGuests must be physically fit for high-altitude travel.\nEssential medicines & warm clothing should be carried.\nLimited medical facilities are available in high-altitude zones.\nElderly guests, infants, and guests with heart/lung conditions must consult a doctor before travel.\n6. Child & Extra Bed Policy\nChildren below 5 years are complimentary (no extra bed).\nExtra bed/mattress charges apply as per hotel rules.\nChild meals depend on hotel meal policy.\n7. Behavior & Conduct\nGuests must respect hotel rules, local culture, and Army guidelines.\nAny damage to hotel or vehicle property will be fully chargeable.\nMisbehavior with hotel staff, drivers, or locals may lead to service denial without refund.\n8. Company Terms (For Service Protection & Benefits)\n8.1 Service Commitment\nSikkim Holidays ensures best-in-class arrangements based on the package chosen.\nAll bookings are made with verified hotels and experienced drivers.\n8.2 Price & Availability\nQuotation is subject to availability at the time of booking.\nHotel/vehicle may change if unavailable, but a similar or upgraded option will be provided.\n8.3 Itinerary Flexibility\nItinerary may change depending on weather, permits, or local restrictions.\nCompany reserves the right to adjust sightseeing timings for smooth operations.\n8.4 Liability\nSikkim Holidays acts as a facilitator between guest and service providers (hotels, transport, permits).\nCompany is not responsible for loss of luggage, personal belongings, or delays caused by third-party vendors.\n8.5 Compliance\nGuests must adhere to permit rules, hotel regulations, and driver instructions.\nNon-compliance may lead to cancellation of services without refund.\n8.6 Payment Liability\nBooking is considered confirmed only after advance payment is received.\nIn case of non-payment of balance amount, services may be withheld or cancelled.	Cancellation Policy\n30+ Days Before Travel:\n80% of the total paid amount refunded\n(Admin charges + GST will be deducted).\n15–30 Days Before Travel:\n50% refund of the package cost.\nLess Than 15 Days:\nNo refund applicable.\nRefund Processing Time:\nRefunds (if applicable) will be processed within 7–10 working days.	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Sightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done as Per itieanry\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places	1.⁠ ⁠ Booking Confirmation\n3-Star Category Hotels: Minimum 30% advance required.\n4-Star & Above Category Hotels (Summit Group, Udaan, or similar): Minimum 50% advance required.\n2.⁠ ⁠ Payment Methods	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	6000.00	f	83f4406f-5799-4252-a7b7-8718a9e49530	\N	\N
e7b49398-c6cf-4318-8c3a-cf102f2be76e	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	\N	draft	\N	\N	INR	2	0	\N	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-04 07:08:10.952	2026-04-04 06:59:44.302	2026-04-04 07:08:10.953	\N	\N	\N	\N	\N	\N	\N	\N	f	f5d551b1-647c-476c-95f9-5036db31e6fa	\N	\N
b8648df3-51cf-4a49-8ba2-9e224194bb10	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	vV5A3e4Klbv6	published	\N	\N	INR	2	0	\N	510f6989-6adf-4cc6-bd94-96003cd2ae15	2026-04-04 06:07:25.517	2026-04-04 04:26:27.476	2026-04-04 06:07:25.518	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N
33dfe3c4-2cec-428c-b133-12fcb29bd454	5Day - 4Night Gangtok Tour (Template)	\N	\N	\N	published	\N	\N	INR	2	0	\N	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-04 05:23:27.169	2026-04-04 04:55:51.52	2026-04-04 05:23:27.17	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	\N	\N
2930cb83-3e69-4495-a858-9fc520d019c0	5Day - 4Night Gangtok Tour	\N	\N	\N	draft	\N	\N	INR	2	0	\N	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-04 05:23:44.109	2026-04-04 04:57:42.155	2026-04-04 05:23:44.11	\N	\N	\N	\N	\N	\N	\N	\N	f	33dfe3c4-2cec-428c-b133-12fcb29bd454	\N	\N
0fe6eea6-3c10-4d1f-ab2a-dc015703a28b	Gangtok Lachen Lachung Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-04 07:08:12.923	2026-04-04 06:46:38.652	2026-04-04 07:08:12.924	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	\N	\N	f	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	\N	\N
c6256659-08e8-4e4b-b208-ff2accae92ab	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	\N	draft	\N	\N	INR	2	0	\N	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-04 07:08:15.567	2026-04-04 05:36:47.707	2026-04-04 07:08:15.568	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N
f5d551b1-647c-476c-95f9-5036db31e6fa	7Day - Aritar-Zuluk-Gangtok-Pelling Tour 	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	DPw_iaCvJ2ik	published	6000.00	\N	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-08 18:56:07.189	2026-04-04 05:30:17.102	2026-04-08 18:56:07.19	\N	\N	\N	\N	\N	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	6000.00	t	\N	2026-05-15	2026-05-21
615a7192-2158-4907-8f2b-69ce38fd2c9d	Gangtok Lachen Lachung Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	54000.00	6000.00	INR	5	1	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-04 07:08:06.342	2026-04-04 01:31:26.93	2026-04-04 07:08:06.346	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	[{"id": "lajb5vc4e", "name": "Booking Payment", "type": "Service", "price": "9000", "markup": 0, "isPerPerson": true}]	54000.00	f	\N	\N	\N
16010103-8491-4406-b5cb-3d42fb03dc4d	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	\N	draft	\N	\N	INR	2	0	\N	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-04 08:19:55.496	2026-04-04 08:19:00.489	2026-04-04 08:19:55.497	\N	\N	\N	\N	\N	\N	\N	\N	f	f5d551b1-647c-476c-95f9-5036db31e6fa	\N	\N
e6aede20-a35b-49ce-97f2-38cb098c0579	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	\N	draft	\N	\N	INR	2	0	\N	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-04 08:19:45.727	2026-04-04 08:18:05.068	2026-04-04 08:19:45.727	\N	\N	\N	\N	\N	\N	\N	\N	f	f5d551b1-647c-476c-95f9-5036db31e6fa	\N	\N
6d8bf505-3c8d-4ba6-9a8f-3291703a87d8	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	\N	draft	\N	\N	INR	2	0	\N	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-04 08:19:49.681	2026-04-04 08:19:08.881	2026-04-04 08:19:49.682	\N	\N	\N	\N	\N	\N	\N	\N	f	f5d551b1-647c-476c-95f9-5036db31e6fa	\N	\N
8c37b487-44b0-418c-a8c1-04cd9567e39b	Gangtok Lachen Lachung Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-04 08:19:53.331	2026-04-04 08:18:08.449	2026-04-04 08:19:53.332	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	\N	\N	f	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	\N	\N
3bbc19c9-257e-490f-b266-2e36d112e9f9	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	\N	draft	6000.00	\N	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-05 20:12:58.788	2026-04-05 15:14:46.271	2026-04-05 20:12:58.79	\N	\N	\N	\N	\N	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	6000.00	f	f5d551b1-647c-476c-95f9-5036db31e6fa	\N	\N
2bf89103-3d87-4629-8062-3be48123177c	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	\N	draft	15000.00	\N	INR	5	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-06 01:00:07.745	2026-04-04 17:20:34.979	2026-04-06 01:00:07.746	\N	\N	\N	\N	\N	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	15000.00	f	f5d551b1-647c-476c-95f9-5036db31e6fa	\N	\N
9e09df64-62d1-4bd9-a90b-cb52eb9a2dd0	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	\N	draft	6000.00	\N	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-05 20:12:52.971	2026-04-04 17:16:12.221	2026-04-05 20:12:52.973	\N	\N	\N	\N	\N	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	6000.00	f	f5d551b1-647c-476c-95f9-5036db31e6fa	\N	\N
20c3aa9b-b85b-4be5-970f-21fc668f569b	Gangtok Lachen Lachung Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-23 07:31:27.989	2026-04-23 07:30:52.157	2026-04-23 07:31:27.99	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	\N	\N	f	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	\N	\N
6cceb0e3-ab28-4ec1-9329-0a5de95c630c	Gangtok Lachen Lachung Tour (Template)	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	published	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-06 00:41:57.3	2026-04-06 00:40:58.909	2026-04-06 00:41:57.301	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	\N	\N	t	\N	\N	\N
99965787-2604-4fdc-b174-658d85ceb93b	.	\N	\N	\N	draft	\N	\N	INR	2	0	\N	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-09 01:48:51.297	2026-04-09 01:48:33.31	2026-04-09 01:48:51.298	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N
6e7f2e3c-39d4-4d96-a3af-fcad95f5f73e	7Day - Aritar-Zuluk-Gangtok-Pelling Tour 	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	\N	draft	6000.00	\N	INR	2	0	0.00	510f6989-6adf-4cc6-bd94-96003cd2ae15	2026-04-07 02:13:15.727	2026-04-06 06:40:35.033	2026-04-07 02:13:15.728	\N	\N	\N	\N	\N	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	6000.00	f	f5d551b1-647c-476c-95f9-5036db31e6fa	\N	\N
8b17a394-37e4-4354-b4a4-48baa5d4a1e7	7Day - Aritar-Zuluk-Gangtok-Pelling Tour 	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	\N	draft	6000.00	\N	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-07 02:13:24.995	2026-04-07 02:13:18.754	2026-04-07 02:13:24.996	\N	\N	\N	\N	\N	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	6000.00	f	f5d551b1-647c-476c-95f9-5036db31e6fa	\N	\N
5a5011e0-e186-46a2-822f-96a2f41cea17	7Day - Aritar-Zuluk-Gangtok-Pelling Tour 	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	GOmduF5o7hue	published	6000.00	\N	INR	2	0	0.00	510f6989-6adf-4cc6-bd94-96003cd2ae15	2026-04-07 02:13:38.323	2026-04-06 06:40:42.024	2026-04-07 02:13:38.324	\N	\N	\N	\N	\N	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	6000.00	f	f5d551b1-647c-476c-95f9-5036db31e6fa	\N	2026-04-08
020dd189-7e3a-41c7-b01d-04d81c323449	..	\N	\N	\N	draft	\N	\N	INR	2	0	\N	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-07 02:24:30.218	2026-04-07 02:24:08.727	2026-04-07 02:24:30.219	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N
ca7cf7bc-765d-4fea-8963-d5c0b5273f1a	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	PAW2fmP6cdsW	published	6000.00	\N	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-09 06:00:53.386	2026-04-06 00:58:57.329	2026-04-09 06:00:53.387	\N	\N	\N	\N	\N	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	6000.00	f	f5d551b1-647c-476c-95f9-5036db31e6fa	2026-04-16	2026-04-20
bb600f5c-f403-4356-9f85-4b3c02bb5523	Gangtok Lachen Lachung Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	cXAeQVbVKu9q	published	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-09 18:53:08.006	2026-04-09 05:59:37.004	2026-04-09 18:53:08.007	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	\N	\N	f	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	2026-04-17	2026-04-23
27b10c1d-5542-4c8b-8311-6dcb4a76e026	Gangtok Lachen Lachung Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	HRKYJYutISsz	published	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-10 04:38:36.568	2026-04-04 16:24:29.602	2026-04-10 04:38:36.569	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	\N	\N	f	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	2026-04-06	2026-04-18
f21339a4-bf54-44b7-acc2-06d29fed6f9d	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775758715/travelcrm/itineraries/f21339a4-bf54-44b7-acc2-06d29fed6f9d/cover/rishi-sreekar-yGtfwvpGkfM-unsplash.jpg	\N	draft	6000.00	\N	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-09 18:53:09.984	2026-04-09 16:08:12.281	2026-04-09 18:53:09.985	1. Hotel Policies\nStandard Check-in: 12:00 PM, Check-out: 11:00 AM (varies by hotel).\nEarly check-in/late check-out subject to availability & additional charges.\nRoom heaters are chargeable in most hotels.\nNorth Sikkim hotels provide basic amenities due to remote location.\nExtra Bed/Extra Mattress:\nProvided strictly as per hotel policy. Some hotels provide mattresses instead of beds.\nMeals (3-Star Basic Hotels):\nMeal quality and variety are completely dependent on hotel policy (may be simple/homely).\nMeals (Premium Hotels – 3-Star Above):\nMost hotels offer buffet meals, but this is subject to hotel arrangements.\n2. Transportation Terms\nNon-AC vehicles provided (AC not allowed in hilly regions).\nVehicles operate point-to-point as per local union rules.\nSame vehicle may not be allowed for all sightseeing points.\nVehicle will not wait beyond the standard allotted time.\nVehicle replacement due to technical issues will be arranged as per availability without compensation for delays.\n3. Permit & Documentation\nOnly ILP (Inner Line Permit) is included.\nArmy-restricted permits such as Nathula Pass, Zero Point, Kala Patthar, Mt. Katao are not included.\nValid ID proof required: Voter ID / Passport / Driving License.\nAadhaar & PAN are NOT accepted for permits.\nPassport-size photos required.\nIn case of permit closure due to weather/Army restrictions, no refund is applicable.\n4. Unforeseen Circumstances\nSikkim Holidays will not be responsible for delays, skipped sightseeing, or itinerary changes due to:\nWeather issues\nLandslides\nRoadblocks / Strikes\nVehicle breakdowns\nGovernment or Army restrictions\nNatural calamities\nAny condition beyond control\nNo refund or compensation shall be provided in such situations.\n5. Health & Safety\nGuests must be physically fit for high-altitude travel.\nEssential medicines & warm clothing should be carried.\nLimited medical facilities are available in high-altitude zones.\nElderly guests, infants, and guests with heart/lung conditions must consult a doctor before travel.\n6. Child & Extra Bed Policy\nChildren below 5 years are complimentary (no extra bed).\nExtra bed/mattress charges apply as per hotel rules.\nChild meals depend on hotel meal policy.\n7. Behavior & Conduct\nGuests must respect hotel rules, local culture, and Army guidelines.\nAny damage to hotel or vehicle property will be fully chargeable.\nMisbehavior with hotel staff, drivers, or locals may lead to service denial without refund.\n8. Company Terms (For Service Protection & Benefits)\n8.1 Service Commitment\nSikkim Holidays ensures best-in-class arrangements based on the package chosen.\nAll bookings are made with verified hotels and experienced drivers.\n8.2 Price & Availability\nQuotation is subject to availability at the time of booking.\nHotel/vehicle may change if unavailable, but a similar or upgraded option will be provided.\n8.3 Itinerary Flexibility\nItinerary may change depending on weather, permits, or local restrictions.\nCompany reserves the right to adjust sightseeing timings for smooth operations.\n8.4 Liability\nSikkim Holidays acts as a facilitator between guest and service providers (hotels, transport, permits).\nCompany is not responsible for loss of luggage, personal belongings, or delays caused by third-party vendors.\n8.5 Compliance\nGuests must adhere to permit rules, hotel regulations, and driver instructions.\nNon-compliance may lead to cancellation of services without refund.\n8.6 Payment Liability\nBooking is considered confirmed only after advance payment is received.\nIn case of non-payment of balance amount, services may be withheld or cancelled.	\n30+ Days Before Travel:\n80% of the total paid amount refunded\n(Admin charges + GST will be deducted).\n15–30 Days Before Travel:\n50% refund of the package cost.\nLess Than 15 Days:\nNo refund applicable.\nRefund Processing Time:\nRefunds (if applicable) will be processed within 7–10 working days.	-5% GST\n-Any Kind of Drinks (Alcoholic, Mineral, Aerated).\n-Camel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\n-Oxygen Cylinder\n-Extra meals above Itinerary, Laundry, Telephone Charges, and Room service.\n-Any Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\n-Lunch at any places\n-Medical and Insurance.\n-Any type of Natural Crises, Road Blocking and Flight Delay Charges.\n-Flight ticket.\n-Anything not specified under the head "Prices included"	-Sightseeing by private car\n-Inner line Permit\n-Environmental fee as per the itinerary.\n-All sightseeing which is part of tour                 \n-Accommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places	1.⁠ ⁠ Booking Confirmation\n3-Star Category Hotels: Minimum 30% advance required.\n4-Star & Above Category Hotels (Summit Group, Udaan, or similar): Minimum 50% advance required.	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	6000.00	f	83f4406f-5799-4252-a7b7-8718a9e49530	2026-04-10	2026-04-14
0dc216b0-2e16-496d-ac8c-3650bef26fc5	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	\N	draft	6000.00	\N	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-10 04:22:51.4	2026-04-10 02:17:05.04	2026-04-10 04:22:51.401	\N	\N	\N	\N	\N	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	6000.00	f	83f4406f-5799-4252-a7b7-8718a9e49530	2026-04-11	2026-04-15
83f4406f-5799-4252-a7b7-8718a9e49530	5Day - 4Night Gangtok Tour (Template)	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	\N	published	6000.00	\N	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	\N	2026-04-08 18:55:53.089	2026-04-10 02:19:30.23	1. Hotel Policies\nStandard Check-in: 12:00 PM, Check-out: 11:00 AM (varies by hotel).\nEarly check-in/late check-out subject to availability & additional charges.\nRoom heaters are chargeable in most hotels.\nNorth Sikkim hotels provide basic amenities due to remote location.\nExtra Bed/Extra Mattress:\nProvided strictly as per hotel policy. Some hotels provide mattresses instead of beds.\nMeals (3-Star Basic Hotels):\nMeal quality and variety are completely dependent on hotel policy (may be simple/homely).\nMeals (Premium Hotels – 3-Star Above):\nMost hotels offer buffet meals, but this is subject to hotel arrangements.\n2. Transportation Terms\nNon-AC vehicles provided (AC not allowed in hilly regions).\nVehicles operate point-to-point as per local union rules.\nSame vehicle may not be allowed for all sightseeing points.\nVehicle will not wait beyond the standard allotted time.\nVehicle replacement due to technical issues will be arranged as per availability without compensation for delays.\n3. Permit & Documentation\nOnly ILP (Inner Line Permit) is included.\nArmy-restricted permits such as Nathula Pass, Zero Point, Kala Patthar, Mt. Katao are not included.\nValid ID proof required: Voter ID / Passport / Driving License.\nAadhaar & PAN are NOT accepted for permits.\nPassport-size photos required.\nIn case of permit closure due to weather/Army restrictions, no refund is applicable.\n4. Unforeseen Circumstances\nSikkim Holidays will not be responsible for delays, skipped sightseeing, or itinerary changes due to:\nWeather issues\nLandslides\nRoadblocks / Strikes\nVehicle breakdowns\nGovernment or Army restrictions\nNatural calamities\nAny condition beyond control\nNo refund or compensation shall be provided in such situations.\n5. Health & Safety\nGuests must be physically fit for high-altitude travel.\nEssential medicines & warm clothing should be carried.\nLimited medical facilities are available in high-altitude zones.\nElderly guests, infants, and guests with heart/lung conditions must consult a doctor before travel.\n6. Child & Extra Bed Policy\nChildren below 5 years are complimentary (no extra bed).\nExtra bed/mattress charges apply as per hotel rules.\nChild meals depend on hotel meal policy.\n7. Behavior & Conduct\nGuests must respect hotel rules, local culture, and Army guidelines.\nAny damage to hotel or vehicle property will be fully chargeable.\nMisbehavior with hotel staff, drivers, or locals may lead to service denial without refund.\n8. Company Terms (For Service Protection & Benefits)\n8.1 Service Commitment\nSikkim Holidays ensures best-in-class arrangements based on the package chosen.\nAll bookings are made with verified hotels and experienced drivers.\n8.2 Price & Availability\nQuotation is subject to availability at the time of booking.\nHotel/vehicle may change if unavailable, but a similar or upgraded option will be provided.\n8.3 Itinerary Flexibility\nItinerary may change depending on weather, permits, or local restrictions.\nCompany reserves the right to adjust sightseeing timings for smooth operations.\n8.4 Liability\nSikkim Holidays acts as a facilitator between guest and service providers (hotels, transport, permits).\nCompany is not responsible for loss of luggage, personal belongings, or delays caused by third-party vendors.\n8.5 Compliance\nGuests must adhere to permit rules, hotel regulations, and driver instructions.\nNon-compliance may lead to cancellation of services without refund.\n8.6 Payment Liability\nBooking is considered confirmed only after advance payment is received.\nIn case of non-payment of balance amount, services may be withheld or cancelled.	Cancellation Policy\n30+ Days Before Travel:\n80% of the total paid amount refunded\n(Admin charges + GST will be deducted).\n15–30 Days Before Travel:\n50% refund of the package cost.\nLess Than 15 Days:\nNo refund applicable.\nRefund Processing Time:\nRefunds (if applicable) will be processed within 7–10 working days.	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Sightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done as Per itieanry\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places	1.⁠ ⁠ Booking Confirmation\n3-Star Category Hotels: Minimum 30% advance required.\n4-Star & Above Category Hotels (Summit Group, Udaan, or similar): Minimum 50% advance required.\n2.⁠ ⁠ Payment Methods	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	6000.00	t	\N	\N	\N
0ad965a6-cdb0-4dbb-b594-4ac2070cbe58	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	lwmq4BFpF9tp	published	8000.00	\N	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	\N	2026-04-10 04:39:22.85	2026-04-13 05:55:31.11	1. Hotel Policies\nStandard Check-in: 12:00 PM, Check-out: 11:00 AM (varies by hotel).\nEarly check-in/late check-out subject to availability & additional charges.\nRoom heaters are chargeable in most hotels.\nNorth Sikkim hotels provide basic amenities due to remote location.\nExtra Bed/Extra Mattress:\nProvided strictly as per hotel policy. Some hotels provide mattresses instead of beds.\nMeals (3-Star Basic Hotels):\nMeal quality and variety are completely dependent on hotel policy (may be simple/homely).\nMeals (Premium Hotels – 3-Star Above):\nMost hotels offer buffet meals, but this is subject to hotel arrangements.\n2. Transportation Terms\nNon-AC vehicles provided (AC not allowed in hilly regions).\nVehicles operate point-to-point as per local union rules.\nSame vehicle may not be allowed for all sightseeing points.\nVehicle will not wait beyond the standard allotted time.\nVehicle replacement due to technical issues will be arranged as per availability without compensation for delays.\n3. Permit & Documentation\nOnly ILP (Inner Line Permit) is included.\nArmy-restricted permits such as Nathula Pass, Zero Point, Kala Patthar, Mt. Katao are not included.\nValid ID proof required: Voter ID / Passport / Driving License.\nAadhaar & PAN are NOT accepted for permits.\nPassport-size photos required.\nIn case of permit closure due to weather/Army restrictions, no refund is applicable.\n4. Unforeseen Circumstances\nSikkim Holidays will not be responsible for delays, skipped sightseeing, or itinerary changes due to:\nWeather issues\nLandslides\nRoadblocks / Strikes\nVehicle breakdowns\nGovernment or Army restrictions\nNatural calamities\nAny condition beyond control\nNo refund or compensation shall be provided in such situations.\n5. Health & Safety\nGuests must be physically fit for high-altitude travel.\nEssential medicines & warm clothing should be carried.\nLimited medical facilities are available in high-altitude zones.\nElderly guests, infants, and guests with heart/lung conditions must consult a doctor before travel.\n6. Child & Extra Bed Policy\nChildren below 5 years are complimentary (no extra bed).\nExtra bed/mattress charges apply as per hotel rules.\nChild meals depend on hotel meal policy.\n7. Behavior & Conduct\nGuests must respect hotel rules, local culture, and Army guidelines.\nAny damage to hotel or vehicle property will be fully chargeable.\nMisbehavior with hotel staff, drivers, or locals may lead to service denial without refund.\n8. Company Terms (For Service Protection & Benefits)\n8.1 Service Commitment\nSikkim Holidays ensures best-in-class arrangements based on the package chosen.\nAll bookings are made with verified hotels and experienced drivers.\n8.2 Price & Availability\nQuotation is subject to availability at the time of booking.\nHotel/vehicle may change if unavailable, but a similar or upgraded option will be provided.\n8.3 Itinerary Flexibility\nItinerary may change depending on weather, permits, or local restrictions.\nCompany reserves the right to adjust sightseeing timings for smooth operations.\n8.4 Liability\nSikkim Holidays acts as a facilitator between guest and service providers (hotels, transport, permits).\nCompany is not responsible for loss of luggage, personal belongings, or delays caused by third-party vendors.\n8.5 Compliance\nGuests must adhere to permit rules, hotel regulations, and driver instructions.\nNon-compliance may lead to cancellation of services without refund.\n8.6 Payment Liability\nBooking is considered confirmed only after advance payment is received.\nIn case of non-payment of balance amount, services may be withheld or cancelled.	Cancellation Policy\n30+ Days Before Travel:\n80% of the total paid amount refunded\n(Admin charges + GST will be deducted).\n15–30 Days Before Travel:\n50% refund of the package cost.\nLess Than 15 Days:\nNo refund applicable.\nRefund Processing Time:\nRefunds (if applicable) will be processed within 7–10 working days.	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Sightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done as Per itieanry\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places	1.⁠ ⁠ Booking Confirmation\n3-Star Category Hotels: Minimum 30% advance required.\n4-Star & Above Category Hotels (Summit Group, Udaan, or similar): Minimum 50% advance required.\n2.⁠ ⁠ Payment Methods	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "4000", "markup": 0, "isPerPerson": true}]	8000.00	f	83f4406f-5799-4252-a7b7-8718a9e49530	2026-04-11	2026-04-15
19a94c0f-bb35-46bb-9625-756af72ca8e5	5Day - 4Night Gangtok Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775280355/travelcrm/itineraries/b8648df3-51cf-4a49-8ba2-9e224194bb10/cover/photo-1650730005180-2c849af5d6cc.avif	SRTkq7ixdtsr	published	6000.00	\N	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-10 04:14:06.424	2026-04-10 02:19:47.237	2026-04-10 04:14:06.425	1. Hotel Policies\nStandard Check-in: 12:00 PM, Check-out: 11:00 AM (varies by hotel).\nEarly check-in/late check-out subject to availability & additional charges.\nRoom heaters are chargeable in most hotels.\nNorth Sikkim hotels provide basic amenities due to remote location.\nExtra Bed/Extra Mattress:\nProvided strictly as per hotel policy. Some hotels provide mattresses instead of beds.\nMeals (3-Star Basic Hotels):\nMeal quality and variety are completely dependent on hotel policy (may be simple/homely).\nMeals (Premium Hotels – 3-Star Above):\nMost hotels offer buffet meals, but this is subject to hotel arrangements.\n2. Transportation Terms\nNon-AC vehicles provided (AC not allowed in hilly regions).\nVehicles operate point-to-point as per local union rules.\nSame vehicle may not be allowed for all sightseeing points.\nVehicle will not wait beyond the standard allotted time.\nVehicle replacement due to technical issues will be arranged as per availability without compensation for delays.\n3. Permit & Documentation\nOnly ILP (Inner Line Permit) is included.\nArmy-restricted permits such as Nathula Pass, Zero Point, Kala Patthar, Mt. Katao are not included.\nValid ID proof required: Voter ID / Passport / Driving License.\nAadhaar & PAN are NOT accepted for permits.\nPassport-size photos required.\nIn case of permit closure due to weather/Army restrictions, no refund is applicable.\n4. Unforeseen Circumstances\nSikkim Holidays will not be responsible for delays, skipped sightseeing, or itinerary changes due to:\nWeather issues\nLandslides\nRoadblocks / Strikes\nVehicle breakdowns\nGovernment or Army restrictions\nNatural calamities\nAny condition beyond control\nNo refund or compensation shall be provided in such situations.\n5. Health & Safety\nGuests must be physically fit for high-altitude travel.\nEssential medicines & warm clothing should be carried.\nLimited medical facilities are available in high-altitude zones.\nElderly guests, infants, and guests with heart/lung conditions must consult a doctor before travel.\n6. Child & Extra Bed Policy\nChildren below 5 years are complimentary (no extra bed).\nExtra bed/mattress charges apply as per hotel rules.\nChild meals depend on hotel meal policy.\n7. Behavior & Conduct\nGuests must respect hotel rules, local culture, and Army guidelines.\nAny damage to hotel or vehicle property will be fully chargeable.\nMisbehavior with hotel staff, drivers, or locals may lead to service denial without refund.\n8. Company Terms (For Service Protection & Benefits)\n8.1 Service Commitment\nSikkim Holidays ensures best-in-class arrangements based on the package chosen.\nAll bookings are made with verified hotels and experienced drivers.\n8.2 Price & Availability\nQuotation is subject to availability at the time of booking.\nHotel/vehicle may change if unavailable, but a similar or upgraded option will be provided.\n8.3 Itinerary Flexibility\nItinerary may change depending on weather, permits, or local restrictions.\nCompany reserves the right to adjust sightseeing timings for smooth operations.\n8.4 Liability\nSikkim Holidays acts as a facilitator between guest and service providers (hotels, transport, permits).\nCompany is not responsible for loss of luggage, personal belongings, or delays caused by third-party vendors.\n8.5 Compliance\nGuests must adhere to permit rules, hotel regulations, and driver instructions.\nNon-compliance may lead to cancellation of services without refund.\n8.6 Payment Liability\nBooking is considered confirmed only after advance payment is received.\nIn case of non-payment of balance amount, services may be withheld or cancelled.	Cancellation Policy\n30+ Days Before Travel:\n80% of the total paid amount refunded\n(Admin charges + GST will be deducted).\n15–30 Days Before Travel:\n50% refund of the package cost.\nLess Than 15 Days:\nNo refund applicable.\nRefund Processing Time:\nRefunds (if applicable) will be processed within 7–10 working days.	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Sightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done as Per itieanry\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places	1.⁠ ⁠ Booking Confirmation\n3-Star Category Hotels: Minimum 30% advance required.\n4-Star & Above Category Hotels (Summit Group, Udaan, or similar): Minimum 50% advance required.\n2.⁠ ⁠ Payment Methods	\N	[{"id": "4h2k8xhbk", "name": "hotel+ servies ", "type": "Service", "price": "3000", "markup": 0, "isPerPerson": true}]	6000.00	f	83f4406f-5799-4252-a7b7-8718a9e49530	2026-04-18	2026-04-22
66a1d196-8590-4897-8a8e-fe404278dad9	7D & 6N Aritar , Zuluk , Gangtok & Pelling Tour	\N	\N	\N	draft	\N	\N	INR	2	0	\N	510f6989-6adf-4cc6-bd94-96003cd2ae15	\N	2026-04-13 04:39:11.805	2026-04-13 04:39:11.805	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N
4ddd7eb2-9c79-42c1-a692-d8e585abfb41	7D & 6N Aritar , Zuluk , Gangtok & Pelling Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	draft	\N	\N	INR	2	0	\N	a860dff1-8690-4627-bb5b-faefe169d02f	\N	2026-04-13 05:09:18.47	2026-04-13 05:10:03.995	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N
e210a64a-d41a-4dec-be58-0424db603e98	Gangtok Lachen Lachung Tour	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775168861/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/cover/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg	\N	draft	0.00	6000.00	INR	2	0	0.00	a860dff1-8690-4627-bb5b-faefe169d02f	2026-04-13 05:21:21.556	2026-04-13 05:21:11.256	2026-04-13 05:21:21.557	If you have a complaint\nIf you face any problem during your holiday, please inform the relevant supplier (e.g. your hotelier, transporter etc.) and/or our representative immediately who will endeavor to set things right. If your complaint is not resolved locally, please follow this up within 28 days of your return home by writing to us, with your booking reference and all other relevant information. However, please be advised that while we are happy to assist you in the redressal of your complaint, if any, we will be able to extend only our best efforts in managing/coordinating your complaint with the respective service provider. All third party service providers are independent contractors who are at no time under our control or supervision.\nAll booking vouchers and tickets will be provided 3 days before departure.	\nCancellation Policy\nCancellation charges per person\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	5% GST\nAny Kind of Drinks (Alcoholic, Mineral, Aerated).\nCamel Safari Charges, Boating, Rafting and any type of Adventurous Rides etc.\nOxygen Cylinder\nExtra meals above Itinerary, Laundry, Telephone Charges, and Room service.\nAny Kind of Personal Expenses, Optional Tours, And Extra Meals Ordered.\nLunch at any places\nMedical and Insurance.\nAny type of Natural Crises, Road Blocking and Flight Delay Charges.\nFlight ticket.\nAnything not specified under the head "Prices included"	Breakfast\nSightseeing by private car\nInner line Permit\nEnvironmental fee as per the itinerary.\nAll sightseeing which is part of tour Itinerary will be done by Innova/Xylo\nAccommodation on twin/double sharing basis with all destinations.\nDaily breakfast and Dinner at all places.\n 	\nPayment Policy\nBooking Fee\n\nFrom 06 Feb 2024 to 31 Mar 2025\n30 or more days before departure: 25%\nBetween 29 to 20 days before departure: 50%\nBetween 19 to 16 days before departure: 100%\n	6	\N	\N	f	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	\N	\N
\.


--
-- TOC entry 4292 (class 0 OID 25839)
-- Dependencies: 268
-- Data for Name: itinerary_days; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.itinerary_days (id, itinerary_id, day_number, title, destination_id, description, image_url) FROM stdin;
000e72b0-6e0b-4f12-9852-55d553c5bba1	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
9e797468-6303-4b20-9be9-d79c3df98685	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775190080/travelcrm/gallery/ynfildudeak04xhvj2sg.jpg
afd661d1-bf7f-40be-ab4d-6051279d5f41	b8648df3-51cf-4a49-8ba2-9e224194bb10	4	Pelling Full Day Sightseeing 	\N	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
64554acd-90b9-4df7-943c-51fb4052090d	4972d723-ac4b-4f44-aa65-1070af24a9d0	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	\N
5e0512fe-49f2-40ee-bd2c-62ff400f691a	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165277/travelcrm/itineraries/days/240_F_227328395_qU4xDeIcMECqBm2dmEEI0bcQdHpCKw40.jpg
743ea643-b8f2-462b-a80d-1537ba8aa1ce	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165555/travelcrm/itineraries/days/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg
a35d8203-d84f-4c0b-807f-6a5f0c69e42c	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
604e027e-1a7b-40b0-8caa-aa10dc43c91d	4972d723-ac4b-4f44-aa65-1070af24a9d0	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	\N
d3de8191-1b84-495f-a228-c0d23b3c4887	4972d723-ac4b-4f44-aa65-1070af24a9d0	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	\N
f8f8a075-4d26-4920-a32b-555de6c85ad8	4972d723-ac4b-4f44-aa65-1070af24a9d0	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	\N
7b7d1cbd-64c5-4e5a-98bb-9689586b4160	4972d723-ac4b-4f44-aa65-1070af24a9d0	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	\N
345b4c1c-51ee-4ffc-b8a6-6a121c1b003a	4972d723-ac4b-4f44-aa65-1070af24a9d0	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	\N
364b518b-9be3-4dbe-a5bd-8ada1cee565e	4972d723-ac4b-4f44-aa65-1070af24a9d0	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	\N
68a59114-76fb-4fbb-8b94-8e7b53334640	79a65650-2922-419f-adb8-dea295dae7e0	1	Day 1	\N	\N	\N
b249a209-a940-40d0-817b-80ce09e0636b	bd43c724-60e0-4f41-a446-22cb5b15856f	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	\N
4f26a037-98b4-4abb-a999-970a6195b149	83ebd5c7-bb92-47d8-a976-f73286c2d5ad	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	\N
9b40609c-67e2-4090-adc2-9b14a978d1fa	bd43c724-60e0-4f41-a446-22cb5b15856f	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	\N
0e990b40-e920-4ef5-8fec-cc913771c4be	bd43c724-60e0-4f41-a446-22cb5b15856f	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	\N
18856763-1522-49c7-a834-d33ca097045d	bd43c724-60e0-4f41-a446-22cb5b15856f	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	\N
ecb706cc-380f-4d0f-863c-f37eb063bb3f	bd43c724-60e0-4f41-a446-22cb5b15856f	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	\N
401f7062-ffe4-41ab-870f-c05b9b42ba34	bd43c724-60e0-4f41-a446-22cb5b15856f	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	\N
aa28cb18-263f-4699-8a9a-d9474cbea5b8	bd43c724-60e0-4f41-a446-22cb5b15856f	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	\N
747da3cc-002a-42df-8ff0-cfbdce309a47	92999748-1a5e-4237-814a-e431534e1aa3	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	\N
975a838e-b2bc-4ffe-b544-2b9f1f7b3b6e	b8648df3-51cf-4a49-8ba2-9e224194bb10	5	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
85d63c44-f4bd-43b7-a147-a2913465b083	92999748-1a5e-4237-814a-e431534e1aa3	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	\N
2a4b7837-1f73-4e2e-a61d-631805f9fa12	92999748-1a5e-4237-814a-e431534e1aa3	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	\N
b24ab600-d721-4655-b91d-8291844c7841	92999748-1a5e-4237-814a-e431534e1aa3	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	\N
94a648a9-86e6-4796-996e-c2170ff5cc4e	92999748-1a5e-4237-814a-e431534e1aa3	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	\N
463830e1-7a7a-4603-922e-5c9e9dbbabdb	92999748-1a5e-4237-814a-e431534e1aa3	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	\N
c1ab37e4-d515-4e57-8087-5dd8ad426089	92999748-1a5e-4237-814a-e431534e1aa3	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	\N
daf83dfd-a3ec-422e-99cb-d487f318e762	89f8cd1c-c07b-4974-ada6-c5b193da8a97	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	\N
f26b8bba-c1f5-4023-b4e1-44949c0490ed	89f8cd1c-c07b-4974-ada6-c5b193da8a97	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	\N
45690a16-053c-4c2f-aebe-cdbdd6f19e61	89f8cd1c-c07b-4974-ada6-c5b193da8a97	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	\N
6320f41e-996b-4b18-8779-47c664b1dfaa	89f8cd1c-c07b-4974-ada6-c5b193da8a97	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	\N
1659d2fb-3ba8-4e96-bcb6-fe63c8b1748b	89f8cd1c-c07b-4974-ada6-c5b193da8a97	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	\N
d6833992-ecdc-4013-baf4-2ab1cbdf1514	89f8cd1c-c07b-4974-ada6-c5b193da8a97	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	\N
8c83b5de-1f50-4517-b83f-9560d42020b9	89f8cd1c-c07b-4974-ada6-c5b193da8a97	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	\N
f0759e4e-7ae7-4cdf-8edf-d522079c36a5	1764f996-b3fd-4814-b01f-d090ea694ef6	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	\N
b7bc2fd0-8ba9-44aa-8593-f97e896a1555	b8648df3-51cf-4a49-8ba2-9e224194bb10	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	\N	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277007/travelcrm/itineraries/days/Gangtok-photo.jpg
402ce9f2-25f5-4c77-bfef-8139157622d2	1764f996-b3fd-4814-b01f-d090ea694ef6	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	\N
917dc072-60f7-4b61-9ad4-191009178e4a	1764f996-b3fd-4814-b01f-d090ea694ef6	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	\N
7d5d75b8-cf80-49d4-a414-8cf4d2c7c075	1764f996-b3fd-4814-b01f-d090ea694ef6	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	\N
240773fb-4bc0-4464-8980-91b42be1caed	1764f996-b3fd-4814-b01f-d090ea694ef6	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	\N
426d25e3-5930-4ec7-b6d4-785205eb85a7	1764f996-b3fd-4814-b01f-d090ea694ef6	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	\N
64cddb97-eca7-4d98-8df4-1a41a87d26a2	1764f996-b3fd-4814-b01f-d090ea694ef6	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	\N
1194f30b-1da4-41d1-bf4c-e20f22438857	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165586/travelcrm/itineraries/days/pexels-bliss-30156563.jpg
a5f8938c-0d32-4390-8898-066bb5912d5d	83ebd5c7-bb92-47d8-a976-f73286c2d5ad	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	\N
df013032-5735-4c2c-a71b-078a29bbde45	83ebd5c7-bb92-47d8-a976-f73286c2d5ad	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	\N
5b099384-eb2e-458c-a1fc-f0e76d172448	83ebd5c7-bb92-47d8-a976-f73286c2d5ad	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	\N
9f96d757-5ea5-4ba8-877d-e571fc274bde	83ebd5c7-bb92-47d8-a976-f73286c2d5ad	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	\N
714394bb-3c4a-49e4-adc8-e1db043aa612	83ebd5c7-bb92-47d8-a976-f73286c2d5ad	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	\N
67a6618c-0aae-4606-9671-4b131655f54d	83ebd5c7-bb92-47d8-a976-f73286c2d5ad	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	\N
80c54f85-5059-474f-a971-e888bdbad749	6184c7d5-776a-4f9f-a9cb-49bafc8acd15	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	\N
97c2a959-f777-4674-a361-c32c9fbde836	33dfe3c4-2cec-428c-b133-12fcb29bd454	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	\N	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277007/travelcrm/itineraries/days/Gangtok-photo.jpg
7a2ec1c9-1c85-47bf-8476-1e7e451cd7a7	6184c7d5-776a-4f9f-a9cb-49bafc8acd15	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	\N
dfbfd416-8de8-4f29-af43-b7dc6096b627	6184c7d5-776a-4f9f-a9cb-49bafc8acd15	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	\N
f757245c-09ca-4495-9ffa-f5060de7e964	6184c7d5-776a-4f9f-a9cb-49bafc8acd15	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	\N
196ae2e8-5a60-453b-a9d2-ccd73c5df880	6184c7d5-776a-4f9f-a9cb-49bafc8acd15	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	\N
4d7cafd1-fdd2-40b1-809c-b774be56c592	6184c7d5-776a-4f9f-a9cb-49bafc8acd15	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	\N
069dbe91-4f8d-46fd-898f-e3fdf4589702	6184c7d5-776a-4f9f-a9cb-49bafc8acd15	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	\N
4bc54e19-6f49-48ef-b012-63dbd71f6e03	e4b7f9ef-f5d2-4e80-9101-fd0476768b24	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	\N
1079e9eb-60c2-416d-94f5-2aa921785e19	e4b7f9ef-f5d2-4e80-9101-fd0476768b24	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	\N
099842e0-9f20-4408-94a0-8fbe5894d660	e4b7f9ef-f5d2-4e80-9101-fd0476768b24	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	\N
9df8617c-2768-4dec-a49e-9d0d9e117e47	e4b7f9ef-f5d2-4e80-9101-fd0476768b24	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	\N
4473a64d-6ef1-4287-9593-aaf0062c28d8	e4b7f9ef-f5d2-4e80-9101-fd0476768b24	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	\N
db253071-0c21-4282-8a43-d00603e2b3b4	e4b7f9ef-f5d2-4e80-9101-fd0476768b24	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	\N
7394b8f1-05f7-42be-ba47-3a0f47cf51ab	e4b7f9ef-f5d2-4e80-9101-fd0476768b24	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	\N
2ed4785c-41cd-40fc-9718-fc29f7729c85	972d8de3-66fe-46e6-ac53-a1fedc5632fc	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	\N
56f9c834-935e-4686-8a9b-3f7236c608fc	b8648df3-51cf-4a49-8ba2-9e224194bb10	3	Gangtok to Pelling Via Namchi	\N	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
38720542-59ad-4e54-b8ad-f0fe86a03283	972d8de3-66fe-46e6-ac53-a1fedc5632fc	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	\N
70d22290-51e3-491a-aa73-568763b9dfa0	972d8de3-66fe-46e6-ac53-a1fedc5632fc	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	\N
d1bdb8f8-7f51-4046-b653-e06026713ee3	972d8de3-66fe-46e6-ac53-a1fedc5632fc	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	\N
19a4b755-a1bf-441e-8ddf-c6f7e05b51a4	972d8de3-66fe-46e6-ac53-a1fedc5632fc	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	\N
54979bf2-55e6-488c-aa4d-a9289534e6a2	972d8de3-66fe-46e6-ac53-a1fedc5632fc	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	\N
3ac2e81b-977b-48c4-a06c-0ce2c04ed938	972d8de3-66fe-46e6-ac53-a1fedc5632fc	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	\N
4edb5e46-312e-41c3-96e0-d243241a55c7	615a7192-2158-4907-8f2b-69ce38fd2c9d	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
ad322223-6598-4a2a-b263-a089bb00ca6e	6e7f2e3c-39d4-4d96-a3af-fcad95f5f73e	4	Gangtok- (Full Day Local Sight Seeing)	\N	Today, it’s all about Gangtok and its awe-inspiring sights.\r\nBakthang Waterfall\r\nAt the distance of 3 km from Gangtok, Bakthang Waterfall will be your first stop which is an eye-catching attraction that no tourist ever want to miss. Flowing from Ratey Chu, it is a broad waterfall that creates a soothing environment for the visitors to enjoy.\r\nTashi Viewpoint\r\nSubsequently, you can observe the glorious Himalayas from Tashi Viewpoint that will be your binocular to scrutinise the seeking view of snow peaks. Moreover, keep your camera’s panoramic setting on because this is the right spot to capture the entire beauteous landscape.\r\nGanesh Tok\r\nJust wish that it’s a clear day because it’s only on the bright clear days that you can have the most awesome view of the place. Apart from Tashi View Point, Ganesh Tok is the place from where you can have a spectacular view of Gangtok. It is an ancient temple of Lord Ganesha that has a pleasant aura. This place welcomes you through its brilliant entrance, and as you swirl the sights, you will see colourful buntings surrounding the temple.\r\nEnchey Monastery\r\nYour next destination of the day is a 200 years old monastery which was initially established as a small gompa by a tantric artist and renowned exponent among highlander Buddhists, Lama DrupthobKarpo. Enchey Monastery literally means “the Solitary Temple” which now is home to almost 90 monks. Tourists are quite fascinated by the place because it accommodates a number of religious objects and presents Tibetan culture in a beguiling manner.\r\nDirectorate of Handicraft and Handloom\r\nNow, it is time for you to admire the local art and talent depicted through the Handicrafts in this Directorate which is located at the ‘Zero’ point of the city. Here you can buy the majestic artefacts such as Thanka painting, traditional carpets, wooden carved and colourfully painted sculptures and much more. Do DrulChorten Stupa\r\nStanding proudly on the hill Hock, Do DrulChorten, also known as Phurba, is your next station which is also the biggest stupa of Sikkim. This shrine was constructed in 1945 and is encircled with 108 prayer wheels from which visitors gain divine blessings.\r\nInstitute of Tibetology\r\nAfter your spiritual tour, it is time for you to grasp some cultural and educative values of Tibet. One of the most significant institutions of the world, the Institute of Tibetology is that centre where many scholars research on the Tibetan language and tradition. Furthermore, you can know more about Life-at-Tibet through valuable material kept in the museum and Tibetan library that has preserved innumerable rich collections of the studies.\r\nFlower Show\r\nAs an integral part of aesthetic festivity, the locals of Gangtok organise a celebration in the name of Sikkim’s diverse vegetation. The flower show is the International Flower Festival which is celebrated every peak season of blooming. In the fete, the perfect blend of Gangtok’s topography is mirrored when breathtaking blossoms are showcased at a place from every corner of Sikkim. This is a must-visit and stupendous moment for every nature lover. \r\nRopeway & Banjhakri Falls\r\nLast but not the least, you will be enthralled by the bounteous attractiveness of the place when you will travel through Ropeway to reach Banjhakri Falls which is 70 ft tall waterfall surrounded by lush greenery of dense forest. This waterfall ascribes the natives because of their belief that it has all the healing and magical power like any other sacred place.After a busy and most memorable day of your trip, you will be taken back to your hotel where you can enjoy hot and appetising dinner. Spend overnight in your warm room because tomorrow you will visit some more astounding places.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456456/travelcrm/itineraries/days/gangtok.jpg
73e11529-f5cf-47f5-aca6-3f2ebf959958	6e7f2e3c-39d4-4d96-a3af-fcad95f5f73e	5	Gangtok to Pelling Via Ravangla 	\N	Start Day with a heavy breakfast as this day awaits travelling and sightseeing umpteen. On your journey to Pelling you will come across various sightseeing destinations of Ravangla.Our representatives will pick you up from the hotel in the morning and drive you to Pelling. Pelling is a tiny hamlet town in west Sikkim. On your way to Pelling,   After some time here, you will head to Ravangla. Here, you can spend time sightseeing the popular Buddha Park and Temi Tea Gardens. Ravangla offers a scenic view of the Greater Himalayas. Once that’s done, you will arrive at your hotel in Pelling. Enjoy a hearty meal and take a goodnight rest as you look forward to what tomorrow has in store.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456546/travelcrm/itineraries/days/Ravangla.webp
fba85695-43ff-4802-aeca-80352bcd6022	615a7192-2158-4907-8f2b-69ce38fd2c9d	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165262/travelcrm/itineraries/days/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg
2f303543-41ad-442b-8ee9-7aaed14961df	615a7192-2158-4907-8f2b-69ce38fd2c9d	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775190080/travelcrm/gallery/ynfildudeak04xhvj2sg.jpg
5479a72c-04d6-4074-860a-3da7b2c3cc4b	615a7192-2158-4907-8f2b-69ce38fd2c9d	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165586/travelcrm/itineraries/days/pexels-bliss-30156563.jpg
5693ee5f-6e30-49d8-bfc2-6909ee91f183	615a7192-2158-4907-8f2b-69ce38fd2c9d	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165555/travelcrm/itineraries/days/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg
5d61406a-9aa9-4455-b77b-34613d2849d7	615a7192-2158-4907-8f2b-69ce38fd2c9d	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165277/travelcrm/itineraries/days/240_F_227328395_qU4xDeIcMECqBm2dmEEI0bcQdHpCKw40.jpg
a8a7a30e-a4ef-42bb-89f7-497d423ed92a	615a7192-2158-4907-8f2b-69ce38fd2c9d	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
a5e81add-9ef0-42d9-94dc-579d29ef9dea	b8648df3-51cf-4a49-8ba2-9e224194bb10	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	\N	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
439ab0e6-c692-4ace-9893-146ba14585e4	33dfe3c4-2cec-428c-b133-12fcb29bd454	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	\N	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
aba4253b-eb40-4447-82d4-1f0acb43eede	33dfe3c4-2cec-428c-b133-12fcb29bd454	3	Gangtok to Pelling Via Namchi	\N	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
a0753257-a161-4ecd-9618-9b67f43aa487	33dfe3c4-2cec-428c-b133-12fcb29bd454	4	Pelling Full Day Sightseeing 	\N	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
a807ce18-77e6-4a6b-aa4c-2c1aac3a5d26	33dfe3c4-2cec-428c-b133-12fcb29bd454	5	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
c50ce5cb-9956-44a8-a365-5879666445d6	2930cb83-3e69-4495-a858-9fc520d019c0	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	\N	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277007/travelcrm/itineraries/days/Gangtok-photo.jpg
d9d09dbd-f49f-4471-8ead-b0cbbbf0bd15	2930cb83-3e69-4495-a858-9fc520d019c0	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	\N	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
f86cf0e4-9429-49f8-9f63-9911096feec3	2930cb83-3e69-4495-a858-9fc520d019c0	3	Gangtok to Pelling Via Namchi	\N	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
28e9e19d-2ac4-4484-85a0-1a3bfb415c53	2930cb83-3e69-4495-a858-9fc520d019c0	4	Pelling Full Day Sightseeing 	\N	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
9ba60c08-b398-4327-9078-e16517f3721d	2930cb83-3e69-4495-a858-9fc520d019c0	5	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
b1e91094-9c7a-42a1-bfa2-af3ed30cf88a	ca7cf7bc-765d-4fea-8963-d5c0b5273f1a	5	Pelling to NJP / IXB Airport Drop	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
ae7dca7f-73b2-4dc6-9a7a-910e77986600	c6256659-08e8-4e4b-b208-ff2accae92ab	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	\N	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277007/travelcrm/itineraries/days/Gangtok-photo.jpg
113befd3-797e-4f3b-9b31-1c6f56ffb9fe	f5d551b1-647c-476c-95f9-5036db31e6fa	2	ARITAR TO ZULUK TOUR	\N	 After breakfast, start for Zuluk Tour via Rongli Dam, Lingtam, Lingtam Monastery, Keukhela Falls, and finally reach zuluk.\r\n\r\nRongli [Altitude: 5200 ft.] - Rongli is an east Sikkim small township located on the bank of river Rongli. The inner line permit for visit towards Nathula granted over there.\r\n\r\nRongli Dam - The Rongli dam is a concrete dam on the Rongli river with a height of 41m and can hold 45,200 cubic meters of water.\r\n\r\nLingtam [Altitude 5082 ft.] - Lingtam is a small village next after the Rongli permit zone at an altitude of 5000 feet from sea level. It's known for his sun kissed peaceful weather surrounded by the hills of all it four sides. You can visit Lingtam Monestry also.\r\n\r\nKeukhela Falls - The Keukhela falls or Kali Khola falls located on the way of the old silk route in between Lingtam and Padamchen. This fall is 100m in heights and beautifully surrounded by scenic nature. Reach zuluk before lunch.\r\n\r\nZuluk [Altitude: 7000 ft.] - A small village in East Sikkim, part of Old Silk Route 10000 ft. above the sea level gaining popularity amongst the tourists because of its natural virginity, unspoiled nature and amazing Himalayan beauty. Catching a glimpse of the snow capped mountain ranges or sun rising on the sea from the window of the hotel room is something that you might have experienced a lot of times. Overnight stay at Zuluk Homestay	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775455394/travelcrm/itineraries/days/aritar1.webp
4c69f509-28a3-418d-b69a-a4e91b02bfcc	f5d551b1-647c-476c-95f9-5036db31e6fa	3	Zuluk Sightseeing – Tsomgo Lake – Baba Mandir - Gangtok	\N	After an early breakfast, proceed for Zuluk sightseeing, covering Thambi View Point, Lungthung View Point, Zig-Zag Road, and Kupup Lake . Later, drive towards Tsomgo (Changu) Lake to admire its serene beauty, followed by a visit to Baba Harbhajan Singh Mandir. Nathula Pass can be visited on this day subject to permit availability and weather conditions (optional and at extra cost). After sightseeing, continue your drive to Gangtok. On arrival, check in to the hotel and enjoy an overnight stay at Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
9166b457-7c6b-4298-aa23-5ec569f7b39d	ca7cf7bc-765d-4fea-8963-d5c0b5273f1a	4	Pelling Full Day Sightseeing 	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
a19c4cdf-e946-4d97-a364-c90aa372fc1c	f5d551b1-647c-476c-95f9-5036db31e6fa	4	Gangtok- (Full Day Local Sight Seeing)	\N	Today, it’s all about Gangtok and its awe-inspiring sights.\r\nBakthang Waterfall\r\nAt the distance of 3 km from Gangtok, Bakthang Waterfall will be your first stop which is an eye-catching attraction that no tourist ever want to miss. Flowing from Ratey Chu, it is a broad waterfall that creates a soothing environment for the visitors to enjoy.\r\nTashi Viewpoint\r\nSubsequently, you can observe the glorious Himalayas from Tashi Viewpoint that will be your binocular to scrutinise the seeking view of snow peaks. Moreover, keep your camera’s panoramic setting on because this is the right spot to capture the entire beauteous landscape.\r\nGanesh Tok\r\nJust wish that it’s a clear day because it’s only on the bright clear days that you can have the most awesome view of the place. Apart from Tashi View Point, Ganesh Tok is the place from where you can have a spectacular view of Gangtok. It is an ancient temple of Lord Ganesha that has a pleasant aura. This place welcomes you through its brilliant entrance, and as you swirl the sights, you will see colourful buntings surrounding the temple.\r\nEnchey Monastery\r\nYour next destination of the day is a 200 years old monastery which was initially established as a small gompa by a tantric artist and renowned exponent among highlander Buddhists, Lama DrupthobKarpo. Enchey Monastery literally means “the Solitary Temple” which now is home to almost 90 monks. Tourists are quite fascinated by the place because it accommodates a number of religious objects and presents Tibetan culture in a beguiling manner.\r\nDirectorate of Handicraft and Handloom\r\nNow, it is time for you to admire the local art and talent depicted through the Handicrafts in this Directorate which is located at the ‘Zero’ point of the city. Here you can buy the majestic artefacts such as Thanka painting, traditional carpets, wooden carved and colourfully painted sculptures and much more. Do DrulChorten Stupa\r\nStanding proudly on the hill Hock, Do DrulChorten, also known as Phurba, is your next station which is also the biggest stupa of Sikkim. This shrine was constructed in 1945 and is encircled with 108 prayer wheels from which visitors gain divine blessings.\r\nInstitute of Tibetology\r\nAfter your spiritual tour, it is time for you to grasp some cultural and educative values of Tibet. One of the most significant institutions of the world, the Institute of Tibetology is that centre where many scholars research on the Tibetan language and tradition. Furthermore, you can know more about Life-at-Tibet through valuable material kept in the museum and Tibetan library that has preserved innumerable rich collections of the studies.\r\nFlower Show\r\nAs an integral part of aesthetic festivity, the locals of Gangtok organise a celebration in the name of Sikkim’s diverse vegetation. The flower show is the International Flower Festival which is celebrated every peak season of blooming. In the fete, the perfect blend of Gangtok’s topography is mirrored when breathtaking blossoms are showcased at a place from every corner of Sikkim. This is a must-visit and stupendous moment for every nature lover. \r\nRopeway & Banjhakri Falls\r\nLast but not the least, you will be enthralled by the bounteous attractiveness of the place when you will travel through Ropeway to reach Banjhakri Falls which is 70 ft tall waterfall surrounded by lush greenery of dense forest. This waterfall ascribes the natives because of their belief that it has all the healing and magical power like any other sacred place.After a busy and most memorable day of your trip, you will be taken back to your hotel where you can enjoy hot and appetising dinner. Spend overnight in your warm room because tomorrow you will visit some more astounding places.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456456/travelcrm/itineraries/days/gangtok.jpg
176741aa-c900-49ca-994f-29d75ff2e169	83f4406f-5799-4252-a7b7-8718a9e49530	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
0b8ec7bb-e6aa-492d-90d4-960abfd61fa9	c6256659-08e8-4e4b-b208-ff2accae92ab	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	\N	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
273cc930-c921-4466-bcb0-19120b8ac39d	c6256659-08e8-4e4b-b208-ff2accae92ab	3	Gangtok to Pelling Via Namchi	\N	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
ec4ecede-ecec-4466-a803-a252458ab5ec	c6256659-08e8-4e4b-b208-ff2accae92ab	4	Pelling Full Day Sightseeing 	\N	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
f85e70a8-88fe-44a8-b155-6bea16f8643c	c6256659-08e8-4e4b-b208-ff2accae92ab	5	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
d6afdf13-02d4-4e2f-9b37-d1eef6046200	0fe6eea6-3c10-4d1f-ab2a-dc015703a28b	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
e2a142b5-f3c2-4587-ae76-d077edb7ee2f	0dc216b0-2e16-496d-ac8c-3650bef26fc5	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
bc5fb665-f28c-460c-9cc9-e55474f64da0	0fe6eea6-3c10-4d1f-ab2a-dc015703a28b	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165262/travelcrm/itineraries/days/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg
b7022799-17b7-458d-ad45-f8763a266c61	0fe6eea6-3c10-4d1f-ab2a-dc015703a28b	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775190080/travelcrm/gallery/ynfildudeak04xhvj2sg.jpg
ff5e33d7-221d-455f-8fe6-b9a388a4356b	0fe6eea6-3c10-4d1f-ab2a-dc015703a28b	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165586/travelcrm/itineraries/days/pexels-bliss-30156563.jpg
4349e4b2-82b1-449b-87b7-9bf83b53b9a0	0fe6eea6-3c10-4d1f-ab2a-dc015703a28b	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165555/travelcrm/itineraries/days/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg
84bb9b71-ee31-425e-b599-ae7088297e5b	0fe6eea6-3c10-4d1f-ab2a-dc015703a28b	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165277/travelcrm/itineraries/days/240_F_227328395_qU4xDeIcMECqBm2dmEEI0bcQdHpCKw40.jpg
65807aec-b310-4e68-acdb-fb666c4373a6	0fe6eea6-3c10-4d1f-ab2a-dc015703a28b	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
a8a73654-ba9b-4185-a145-18d69bb6cbd4	e7b49398-c6cf-4318-8c3a-cf102f2be76e	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	\N	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277007/travelcrm/itineraries/days/Gangtok-photo.jpg
06e3fa99-d3eb-4a7d-9b34-02aeb29ef5a3	e7b49398-c6cf-4318-8c3a-cf102f2be76e	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	\N	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
2c71142d-e390-474a-83b9-393d27cef134	e7b49398-c6cf-4318-8c3a-cf102f2be76e	3	Gangtok to Pelling Via Namchi	\N	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
f5e5221e-a9ea-49d6-9911-9b99680c3974	e7b49398-c6cf-4318-8c3a-cf102f2be76e	4	Pelling Full Day Sightseeing 	\N	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
5dcc04e2-483d-4c22-b141-1d69a9f639c8	e7b49398-c6cf-4318-8c3a-cf102f2be76e	5	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
cbb78974-985f-4270-ae12-d994b72b53d0	e6aede20-a35b-49ce-97f2-38cb098c0579	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	\N	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277007/travelcrm/itineraries/days/Gangtok-photo.jpg
5bef665b-cb27-4f7a-82a4-10d8d676504d	e6aede20-a35b-49ce-97f2-38cb098c0579	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	\N	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
a1a0ea54-2b29-4dfd-8c99-75cb5b050063	e6aede20-a35b-49ce-97f2-38cb098c0579	3	Gangtok to Pelling Via Namchi	\N	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
ca553eed-dd76-42b6-b24c-900b932304c7	e6aede20-a35b-49ce-97f2-38cb098c0579	4	Pelling Full Day Sightseeing 	\N	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
1d042b8c-2aea-4c26-bc4b-cdfaa4d82916	e6aede20-a35b-49ce-97f2-38cb098c0579	5	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
c66c7826-bd9c-44fd-9e9d-41fe6ed419b5	8c37b487-44b0-418c-a8c1-04cd9567e39b	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
90c23916-4cee-4bbd-a0ae-cd0f0b88e775	8c37b487-44b0-418c-a8c1-04cd9567e39b	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165262/travelcrm/itineraries/days/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg
79b6e91e-5b3b-49ca-9fa4-c51f68c727ec	8c37b487-44b0-418c-a8c1-04cd9567e39b	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775190080/travelcrm/gallery/ynfildudeak04xhvj2sg.jpg
19cfa70e-9637-4ec1-835f-c098b4841dbf	8c37b487-44b0-418c-a8c1-04cd9567e39b	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165586/travelcrm/itineraries/days/pexels-bliss-30156563.jpg
bb2942b8-8d2c-4771-ad50-36febe5b2e1c	8c37b487-44b0-418c-a8c1-04cd9567e39b	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165555/travelcrm/itineraries/days/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg
15cd2acd-b1d7-4e93-a857-a19e18f3a678	8c37b487-44b0-418c-a8c1-04cd9567e39b	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165277/travelcrm/itineraries/days/240_F_227328395_qU4xDeIcMECqBm2dmEEI0bcQdHpCKw40.jpg
657ad0c6-f005-4334-b71c-1b595a1f5b01	8c37b487-44b0-418c-a8c1-04cd9567e39b	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
1f253ace-1e62-476d-a1ff-48bd29db43eb	16010103-8491-4406-b5cb-3d42fb03dc4d	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	\N	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277007/travelcrm/itineraries/days/Gangtok-photo.jpg
7c3b46a8-b96d-49bd-a9df-4a1eff18e57c	16010103-8491-4406-b5cb-3d42fb03dc4d	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	\N	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
e9bc868a-d229-4f0e-a8ca-5ae5b01ba949	16010103-8491-4406-b5cb-3d42fb03dc4d	3	Gangtok to Pelling Via Namchi	\N	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
542b0278-a1a8-425e-9095-11c297c9370a	16010103-8491-4406-b5cb-3d42fb03dc4d	4	Pelling Full Day Sightseeing 	\N	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
7b185f55-c00d-4088-9bcc-9452e9550bd3	16010103-8491-4406-b5cb-3d42fb03dc4d	5	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
b44bf9c2-a986-4f7c-938d-4fd64d3f0bc1	6d8bf505-3c8d-4ba6-9a8f-3291703a87d8	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	\N	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277007/travelcrm/itineraries/days/Gangtok-photo.jpg
a1f993f2-85bb-48ed-864a-6f58a03630f7	6d8bf505-3c8d-4ba6-9a8f-3291703a87d8	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	\N	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
5c69159a-a4c6-466a-a68d-fbf54f801770	6d8bf505-3c8d-4ba6-9a8f-3291703a87d8	3	Gangtok to Pelling Via Namchi	\N	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
d8d5771a-1689-4521-80b6-3557041a4654	6d8bf505-3c8d-4ba6-9a8f-3291703a87d8	4	Pelling Full Day Sightseeing 	\N	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
01245097-273c-43cf-ac24-07b6d7dbdbc6	6d8bf505-3c8d-4ba6-9a8f-3291703a87d8	5	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
acad8d7c-79f8-40fc-90e9-d15c54cf02a3	27b10c1d-5542-4c8b-8311-6dcb4a76e026	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
6c657b93-0daa-422a-b0fa-60786e3eaf98	27b10c1d-5542-4c8b-8311-6dcb4a76e026	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165262/travelcrm/itineraries/days/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg
016a7ed3-db71-4b14-bb3b-5a232d196af8	27b10c1d-5542-4c8b-8311-6dcb4a76e026	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775190080/travelcrm/gallery/ynfildudeak04xhvj2sg.jpg
aada4aa8-7f8c-4a3d-b9ac-0fa2e192229f	27b10c1d-5542-4c8b-8311-6dcb4a76e026	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165586/travelcrm/itineraries/days/pexels-bliss-30156563.jpg
549e9c1a-9fd9-4ae6-ac53-a3a1001e1393	27b10c1d-5542-4c8b-8311-6dcb4a76e026	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165555/travelcrm/itineraries/days/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg
4731ab6e-5529-4b3c-880e-a3b0f5ae4e28	27b10c1d-5542-4c8b-8311-6dcb4a76e026	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165277/travelcrm/itineraries/days/240_F_227328395_qU4xDeIcMECqBm2dmEEI0bcQdHpCKw40.jpg
dd3d9c27-9ea6-4793-a58b-ece15a0c216f	27b10c1d-5542-4c8b-8311-6dcb4a76e026	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
340610e0-7902-4937-9cf7-49088f028d18	9e09df64-62d1-4bd9-a90b-cb52eb9a2dd0	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	\N	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277007/travelcrm/itineraries/days/Gangtok-photo.jpg
0d6c9469-d08b-48ee-88f8-de87721d099c	9e09df64-62d1-4bd9-a90b-cb52eb9a2dd0	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	\N	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
0bc0e742-bbe5-411f-a843-390cc916e96a	9e09df64-62d1-4bd9-a90b-cb52eb9a2dd0	3	Gangtok to Pelling Via Namchi	\N	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
c9efb195-d7bd-4ee5-a5fa-02db3304bb72	9e09df64-62d1-4bd9-a90b-cb52eb9a2dd0	4	Pelling Full Day Sightseeing 	\N	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
52ca67ed-9685-4121-a646-4e091a48cdcd	9e09df64-62d1-4bd9-a90b-cb52eb9a2dd0	5	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
24cee3d5-4a35-4234-a28e-918ce7cacf50	2bf89103-3d87-4629-8062-3be48123177c	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	\N	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277007/travelcrm/itineraries/days/Gangtok-photo.jpg
80d50e38-74ec-4bde-8b61-05e24bfbb0fc	66a1d196-8590-4897-8a8e-fe404278dad9	2	Day 2 -Aritar → Zuluk	051f9729-4b94-4aaf-8811-29de0c2eb244	After breakfast transfer to Zuluk\nEn-route sightseeing:\nRongli Permit\nLingtam\nKeokhola Waterfalls\nPadamchen Village\nArrival & night stay at Zuluk	\N
2cc43202-3a06-47f7-8575-020896c67c6b	2bf89103-3d87-4629-8062-3be48123177c	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	\N	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
2df45acf-0d6a-4661-b9f8-c38d9204e155	2bf89103-3d87-4629-8062-3be48123177c	3	Gangtok to Pelling Via Namchi	\N	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
0d3270fb-d25a-43cc-b7ad-e3d6a57d0bae	2bf89103-3d87-4629-8062-3be48123177c	4	Pelling Full Day Sightseeing 	\N	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
843e1d75-6f6b-46ee-bb03-dbd12c286d51	2bf89103-3d87-4629-8062-3be48123177c	5	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
cd104b3c-ac2d-4d18-a653-b5bf099ca545	3bbc19c9-257e-490f-b266-2e36d112e9f9	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	\N	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
96a27066-4a29-42f6-bf09-8abf9f60397f	66a1d196-8590-4897-8a8e-fe404278dad9	3	Day 3 - Zuluk → Gangtok (via Tsomgo Lake & Baba Mandir)	3134f29d-8635-411f-a6dd-c2562eb7314d	Early morning start\nEn-route sightseeing:\nZig Zag Road (Thambi Viewpoint)\nLungthung\nTukla Valley\nNathang Valley\nKupup Lake (Elephant Lake)\nOld Baba Mandir\nTsomgo Lake\nNew Baba Harbhajan Mandir\nReach Gangtok & night stay	\N
4c09e013-80ef-4854-b6b9-2391e38e847e	3bbc19c9-257e-490f-b266-2e36d112e9f9	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	\N	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
02143239-dd11-4d4d-9cf0-1f319f8dcd90	3bbc19c9-257e-490f-b266-2e36d112e9f9	3	Gangtok to Pelling Via Namchi	\N	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
83031078-d779-4523-bb11-7cd41f6d481a	3bbc19c9-257e-490f-b266-2e36d112e9f9	4	Pelling Full Day Sightseeing 	\N	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
2885a1f0-1fb2-4fcd-aff9-0524977a00e6	3bbc19c9-257e-490f-b266-2e36d112e9f9	5	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
0d17e8e0-eaf8-4d7e-9491-a8a0b152a9ce	6cceb0e3-ab28-4ec1-9329-0a5de95c630c	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
21894f14-a74b-4489-ad84-be554bafd1e1	e210a64a-d41a-4dec-be58-0424db603e98	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165555/travelcrm/itineraries/days/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg
6a230a2f-4077-489c-a108-fb33dde81da2	e210a64a-d41a-4dec-be58-0424db603e98	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165277/travelcrm/itineraries/days/240_F_227328395_qU4xDeIcMECqBm2dmEEI0bcQdHpCKw40.jpg
b2de2491-a434-4c06-ba1a-c96265ed463e	6cceb0e3-ab28-4ec1-9329-0a5de95c630c	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165262/travelcrm/itineraries/days/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg
3d994684-e63e-4feb-b504-d3e1df59adc3	6cceb0e3-ab28-4ec1-9329-0a5de95c630c	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775190080/travelcrm/gallery/ynfildudeak04xhvj2sg.jpg
62a2595f-716e-4d1e-a9f6-4fcc268b4297	6cceb0e3-ab28-4ec1-9329-0a5de95c630c	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165586/travelcrm/itineraries/days/pexels-bliss-30156563.jpg
c777b97b-93ab-4e1e-8fdf-31d17251b11a	6cceb0e3-ab28-4ec1-9329-0a5de95c630c	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165555/travelcrm/itineraries/days/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg
a2d9566e-74c2-42fc-b457-e84f60600197	6cceb0e3-ab28-4ec1-9329-0a5de95c630c	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165277/travelcrm/itineraries/days/240_F_227328395_qU4xDeIcMECqBm2dmEEI0bcQdHpCKw40.jpg
5763779f-cf44-4116-9100-40bfafd709fd	6cceb0e3-ab28-4ec1-9329-0a5de95c630c	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
d31496ae-fd79-4f27-89f0-aeb89c803967	e210a64a-d41a-4dec-be58-0424db603e98	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
8e04d97a-94a7-4c58-9e38-15244e0edfc7	f5d551b1-647c-476c-95f9-5036db31e6fa	1	Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) To Aritar	\N	 Guest will be received by our official at Pakyong Airport (PYG) nearly 30 kilometers from Gangtok Or Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) / Tenzing Norgay Bus Terminus (Junction) – He will assist you for the forwarding journey to Aritar / Lingsey – From Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) is at a distance of 110 kilometers aqnd is nearly 04 - 05 hours drive by road - Aritar in East Sikkim district of the Indian state of Sikkim is known for its natural and landscaped beauty  - Known for lush forest, mountains and rivers - The Aritar Lake (Ghati-Tso) is a nearby attraction, as are traditional villages and monasteries such as Lingsay - Lingsey is nearly 110 kilometers from Siliguri anfd is at an altitude of  4800 feet - Check into Hotel  / Home Stay - Back to Rongli for permit - Night stay at Lingsey or Aritar	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775455295/travelcrm/itineraries/days/aritar.jpg
4e3ea09f-3415-4550-bd7c-d413ef6da80d	ca7cf7bc-765d-4fea-8963-d5c0b5273f1a	3	Gangtok to Pelling Via Namchi	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
3ed1ae51-14fc-4a3e-96f1-9cf351de2eb8	f5d551b1-647c-476c-95f9-5036db31e6fa	6	Full Day Local Sightseeing in Pelling	\N	Give this day an early start with some toothsome breakfast and prepare for local sightseeing in Pelling.\r\n\r\nFirst, head to the Darap Valley. This little hamlet is a perfect picnic spot where you can interact with the locals and take a glimpse into the Sikkimese lifestyle. The local villagers are very warm and friendly and you will enjoy your time spending it in their embrace.\r\n\r\nNext, visit the Rimbi waterfalls and the Kanchenjunga waterfalls. These perennial waterfalls provide refreshment to the mind, body and soul and are one of the major tourist attractions of the town. It is also a major spot for recreational activities like fishing.\r\n\r\nThen, move ahead and visit the Rock Garden and the Khecheopalri Lake. The Rock Garden is studded with gardens and pools and a small stream runs within it. You must take a walk on its meandering footpaths.\r\n\r\nThe Khecheopalri Lake, on another hand, is presumed to be one of the most sacred lakes in Pelling. It is placid, picturesque and a clean water body with no leaves floating over even though it is set amidst a thick bushy forest.\r\n\r\nLastly, visit the Rabdentse Ruins, Pema Yangtse monastery and Helipad Ground. The Rabdentse ruins speak volumes about Sikkim’s glorious past. It is a must see site for archaeological and history lovers.\r\n\r\nThe Pema Yangtse is at a walking distance from here and offers splendid views of the Kanchenjunga ranges. The Helipad ground is also another popular viewing spot to behold the splendid views of the snow-capped ranges. The view of the sunset here is like something you must have never witnessed.\r\n\r\nReturn to the hotel in the evening and stay overnight in Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
4e0bfd1c-c1aa-4ed1-a863-980cdd31d171	6e7f2e3c-39d4-4d96-a3af-fcad95f5f73e	1	Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) To Aritar	\N	 Guest will be received by our official at Pakyong Airport (PYG) nearly 30 kilometers from Gangtok Or Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) / Tenzing Norgay Bus Terminus (Junction) – He will assist you for the forwarding journey to Aritar / Lingsey – From Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) is at a distance of 110 kilometers aqnd is nearly 04 - 05 hours drive by road - Aritar in East Sikkim district of the Indian state of Sikkim is known for its natural and landscaped beauty  - Known for lush forest, mountains and rivers - The Aritar Lake (Ghati-Tso) is a nearby attraction, as are traditional villages and monasteries such as Lingsay - Lingsey is nearly 110 kilometers from Siliguri anfd is at an altitude of  4800 feet - Check into Hotel  / Home Stay - Back to Rongli for permit - Night stay at Lingsey or Aritar	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775455295/travelcrm/itineraries/days/aritar.jpg
f80b36de-6dce-42d5-a451-37dc3b10d11a	6e7f2e3c-39d4-4d96-a3af-fcad95f5f73e	2	ARITAR TO ZULUK TOUR	\N	 After breakfast, start for Zuluk Tour via Rongli Dam, Lingtam, Lingtam Monastery, Keukhela Falls, and finally reach zuluk.\r\n\r\nRongli [Altitude: 5200 ft.] - Rongli is an east Sikkim small township located on the bank of river Rongli. The inner line permit for visit towards Nathula granted over there.\r\n\r\nRongli Dam - The Rongli dam is a concrete dam on the Rongli river with a height of 41m and can hold 45,200 cubic meters of water.\r\n\r\nLingtam [Altitude 5082 ft.] - Lingtam is a small village next after the Rongli permit zone at an altitude of 5000 feet from sea level. It's known for his sun kissed peaceful weather surrounded by the hills of all it four sides. You can visit Lingtam Monestry also.\r\n\r\nKeukhela Falls - The Keukhela falls or Kali Khola falls located on the way of the old silk route in between Lingtam and Padamchen. This fall is 100m in heights and beautifully surrounded by scenic nature. Reach zuluk before lunch.\r\n\r\nZuluk [Altitude: 7000 ft.] - A small village in East Sikkim, part of Old Silk Route 10000 ft. above the sea level gaining popularity amongst the tourists because of its natural virginity, unspoiled nature and amazing Himalayan beauty. Catching a glimpse of the snow capped mountain ranges or sun rising on the sea from the window of the hotel room is something that you might have experienced a lot of times. Overnight stay at Zuluk Homestay	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775455394/travelcrm/itineraries/days/aritar1.webp
3b165456-86aa-4135-8d81-07b478fed188	6e7f2e3c-39d4-4d96-a3af-fcad95f5f73e	3	Zuluk Sightseeing – Tsomgo Lake – Baba Mandir - Gangtok	\N	After an early breakfast, proceed for Zuluk sightseeing, covering Thambi View Point, Lungthung View Point, Zig-Zag Road, and Kupup Lake . Later, drive towards Tsomgo (Changu) Lake to admire its serene beauty, followed by a visit to Baba Harbhajan Singh Mandir. Nathula Pass can be visited on this day subject to permit availability and weather conditions (optional and at extra cost). After sightseeing, continue your drive to Gangtok. On arrival, check in to the hotel and enjoy an overnight stay at Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
8372e0d4-f791-4545-9dce-ea3c396bbc30	6e7f2e3c-39d4-4d96-a3af-fcad95f5f73e	6	Full Day Local Sightseeing in Pelling	\N	Give this day an early start with some toothsome breakfast and prepare for local sightseeing in Pelling.\r\n\r\nFirst, head to the Darap Valley. This little hamlet is a perfect picnic spot where you can interact with the locals and take a glimpse into the Sikkimese lifestyle. The local villagers are very warm and friendly and you will enjoy your time spending it in their embrace.\r\n\r\nNext, visit the Rimbi waterfalls and the Kanchenjunga waterfalls. These perennial waterfalls provide refreshment to the mind, body and soul and are one of the major tourist attractions of the town. It is also a major spot for recreational activities like fishing.\r\n\r\nThen, move ahead and visit the Rock Garden and the Khecheopalri Lake. The Rock Garden is studded with gardens and pools and a small stream runs within it. You must take a walk on its meandering footpaths.\r\n\r\nThe Khecheopalri Lake, on another hand, is presumed to be one of the most sacred lakes in Pelling. It is placid, picturesque and a clean water body with no leaves floating over even though it is set amidst a thick bushy forest.\r\n\r\nLastly, visit the Rabdentse Ruins, Pema Yangtse monastery and Helipad Ground. The Rabdentse ruins speak volumes about Sikkim’s glorious past. It is a must see site for archaeological and history lovers.\r\n\r\nThe Pema Yangtse is at a walking distance from here and offers splendid views of the Kanchenjunga ranges. The Helipad ground is also another popular viewing spot to behold the splendid views of the snow-capped ranges. The view of the sunset here is like something you must have never witnessed.\r\n\r\nReturn to the hotel in the evening and stay overnight in Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
e4269d1d-20c8-4f5e-844a-247b2afa92bc	6e7f2e3c-39d4-4d96-a3af-fcad95f5f73e	7	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
5da69795-d858-4974-9ca9-e370e03a8455	5a5011e0-e186-46a2-822f-96a2f41cea17	1	Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) To Aritar	\N	 Guest will be received by our official at Pakyong Airport (PYG) nearly 30 kilometers from Gangtok Or Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) / Tenzing Norgay Bus Terminus (Junction) – He will assist you for the forwarding journey to Aritar / Lingsey – From Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) is at a distance of 110 kilometers aqnd is nearly 04 - 05 hours drive by road - Aritar in East Sikkim district of the Indian state of Sikkim is known for its natural and landscaped beauty  - Known for lush forest, mountains and rivers - The Aritar Lake (Ghati-Tso) is a nearby attraction, as are traditional villages and monasteries such as Lingsay - Lingsey is nearly 110 kilometers from Siliguri anfd is at an altitude of  4800 feet - Check into Hotel  / Home Stay - Back to Rongli for permit - Night stay at Lingsey or Aritar	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775455295/travelcrm/itineraries/days/aritar.jpg
0dad8757-fff8-4c2f-8295-db3047f37332	5a5011e0-e186-46a2-822f-96a2f41cea17	2	ARITAR TO ZULUK TOUR	\N	 After breakfast, start for Zuluk Tour via Rongli Dam, Lingtam, Lingtam Monastery, Keukhela Falls, and finally reach zuluk.\r\n\r\nRongli [Altitude: 5200 ft.] - Rongli is an east Sikkim small township located on the bank of river Rongli. The inner line permit for visit towards Nathula granted over there.\r\n\r\nRongli Dam - The Rongli dam is a concrete dam on the Rongli river with a height of 41m and can hold 45,200 cubic meters of water.\r\n\r\nLingtam [Altitude 5082 ft.] - Lingtam is a small village next after the Rongli permit zone at an altitude of 5000 feet from sea level. It's known for his sun kissed peaceful weather surrounded by the hills of all it four sides. You can visit Lingtam Monestry also.\r\n\r\nKeukhela Falls - The Keukhela falls or Kali Khola falls located on the way of the old silk route in between Lingtam and Padamchen. This fall is 100m in heights and beautifully surrounded by scenic nature. Reach zuluk before lunch.\r\n\r\nZuluk [Altitude: 7000 ft.] - A small village in East Sikkim, part of Old Silk Route 10000 ft. above the sea level gaining popularity amongst the tourists because of its natural virginity, unspoiled nature and amazing Himalayan beauty. Catching a glimpse of the snow capped mountain ranges or sun rising on the sea from the window of the hotel room is something that you might have experienced a lot of times. Overnight stay at Zuluk Homestay	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775455394/travelcrm/itineraries/days/aritar1.webp
56aaebfd-aa03-48e2-b7e4-7cbc92db2eec	5a5011e0-e186-46a2-822f-96a2f41cea17	3	Zuluk Sightseeing – Tsomgo Lake – Baba Mandir - Gangtok	\N	After an early breakfast, proceed for Zuluk sightseeing, covering Thambi View Point, Lungthung View Point, Zig-Zag Road, and Kupup Lake . Later, drive towards Tsomgo (Changu) Lake to admire its serene beauty, followed by a visit to Baba Harbhajan Singh Mandir. Nathula Pass can be visited on this day subject to permit availability and weather conditions (optional and at extra cost). After sightseeing, continue your drive to Gangtok. On arrival, check in to the hotel and enjoy an overnight stay at Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
0bc76041-546f-434d-ad5d-76f66dd63e69	5a5011e0-e186-46a2-822f-96a2f41cea17	4	Gangtok- (Full Day Local Sight Seeing)	\N	Today, it’s all about Gangtok and its awe-inspiring sights.\r\nBakthang Waterfall\r\nAt the distance of 3 km from Gangtok, Bakthang Waterfall will be your first stop which is an eye-catching attraction that no tourist ever want to miss. Flowing from Ratey Chu, it is a broad waterfall that creates a soothing environment for the visitors to enjoy.\r\nTashi Viewpoint\r\nSubsequently, you can observe the glorious Himalayas from Tashi Viewpoint that will be your binocular to scrutinise the seeking view of snow peaks. Moreover, keep your camera’s panoramic setting on because this is the right spot to capture the entire beauteous landscape.\r\nGanesh Tok\r\nJust wish that it’s a clear day because it’s only on the bright clear days that you can have the most awesome view of the place. Apart from Tashi View Point, Ganesh Tok is the place from where you can have a spectacular view of Gangtok. It is an ancient temple of Lord Ganesha that has a pleasant aura. This place welcomes you through its brilliant entrance, and as you swirl the sights, you will see colourful buntings surrounding the temple.\r\nEnchey Monastery\r\nYour next destination of the day is a 200 years old monastery which was initially established as a small gompa by a tantric artist and renowned exponent among highlander Buddhists, Lama DrupthobKarpo. Enchey Monastery literally means “the Solitary Temple” which now is home to almost 90 monks. Tourists are quite fascinated by the place because it accommodates a number of religious objects and presents Tibetan culture in a beguiling manner.\r\nDirectorate of Handicraft and Handloom\r\nNow, it is time for you to admire the local art and talent depicted through the Handicrafts in this Directorate which is located at the ‘Zero’ point of the city. Here you can buy the majestic artefacts such as Thanka painting, traditional carpets, wooden carved and colourfully painted sculptures and much more. Do DrulChorten Stupa\r\nStanding proudly on the hill Hock, Do DrulChorten, also known as Phurba, is your next station which is also the biggest stupa of Sikkim. This shrine was constructed in 1945 and is encircled with 108 prayer wheels from which visitors gain divine blessings.\r\nInstitute of Tibetology\r\nAfter your spiritual tour, it is time for you to grasp some cultural and educative values of Tibet. One of the most significant institutions of the world, the Institute of Tibetology is that centre where many scholars research on the Tibetan language and tradition. Furthermore, you can know more about Life-at-Tibet through valuable material kept in the museum and Tibetan library that has preserved innumerable rich collections of the studies.\r\nFlower Show\r\nAs an integral part of aesthetic festivity, the locals of Gangtok organise a celebration in the name of Sikkim’s diverse vegetation. The flower show is the International Flower Festival which is celebrated every peak season of blooming. In the fete, the perfect blend of Gangtok’s topography is mirrored when breathtaking blossoms are showcased at a place from every corner of Sikkim. This is a must-visit and stupendous moment for every nature lover. \r\nRopeway & Banjhakri Falls\r\nLast but not the least, you will be enthralled by the bounteous attractiveness of the place when you will travel through Ropeway to reach Banjhakri Falls which is 70 ft tall waterfall surrounded by lush greenery of dense forest. This waterfall ascribes the natives because of their belief that it has all the healing and magical power like any other sacred place.After a busy and most memorable day of your trip, you will be taken back to your hotel where you can enjoy hot and appetising dinner. Spend overnight in your warm room because tomorrow you will visit some more astounding places.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456456/travelcrm/itineraries/days/gangtok.jpg
59e6cff8-4e34-4760-8c70-a62fe0b07232	5a5011e0-e186-46a2-822f-96a2f41cea17	5	Gangtok to Pelling Via Ravangla 	\N	Start Day with a heavy breakfast as this day awaits travelling and sightseeing umpteen. On your journey to Pelling you will come across various sightseeing destinations of Ravangla.Our representatives will pick you up from the hotel in the morning and drive you to Pelling. Pelling is a tiny hamlet town in west Sikkim. On your way to Pelling,   After some time here, you will head to Ravangla. Here, you can spend time sightseeing the popular Buddha Park and Temi Tea Gardens. Ravangla offers a scenic view of the Greater Himalayas. Once that’s done, you will arrive at your hotel in Pelling. Enjoy a hearty meal and take a goodnight rest as you look forward to what tomorrow has in store.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456546/travelcrm/itineraries/days/Ravangla.webp
2bf59d01-d768-48c5-818c-d28aedc5509a	5a5011e0-e186-46a2-822f-96a2f41cea17	6	Full Day Local Sightseeing in Pelling	\N	Give this day an early start with some toothsome breakfast and prepare for local sightseeing in Pelling.\r\n\r\nFirst, head to the Darap Valley. This little hamlet is a perfect picnic spot where you can interact with the locals and take a glimpse into the Sikkimese lifestyle. The local villagers are very warm and friendly and you will enjoy your time spending it in their embrace.\r\n\r\nNext, visit the Rimbi waterfalls and the Kanchenjunga waterfalls. These perennial waterfalls provide refreshment to the mind, body and soul and are one of the major tourist attractions of the town. It is also a major spot for recreational activities like fishing.\r\n\r\nThen, move ahead and visit the Rock Garden and the Khecheopalri Lake. The Rock Garden is studded with gardens and pools and a small stream runs within it. You must take a walk on its meandering footpaths.\r\n\r\nThe Khecheopalri Lake, on another hand, is presumed to be one of the most sacred lakes in Pelling. It is placid, picturesque and a clean water body with no leaves floating over even though it is set amidst a thick bushy forest.\r\n\r\nLastly, visit the Rabdentse Ruins, Pema Yangtse monastery and Helipad Ground. The Rabdentse ruins speak volumes about Sikkim’s glorious past. It is a must see site for archaeological and history lovers.\r\n\r\nThe Pema Yangtse is at a walking distance from here and offers splendid views of the Kanchenjunga ranges. The Helipad ground is also another popular viewing spot to behold the splendid views of the snow-capped ranges. The view of the sunset here is like something you must have never witnessed.\r\n\r\nReturn to the hotel in the evening and stay overnight in Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
4fb03fb8-83ee-4290-86d0-ccee9c8bb2ee	5a5011e0-e186-46a2-822f-96a2f41cea17	7	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
116c6073-3932-4b99-bb27-846361660cdb	8b17a394-37e4-4354-b4a4-48baa5d4a1e7	1	Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) To Aritar	\N	 Guest will be received by our official at Pakyong Airport (PYG) nearly 30 kilometers from Gangtok Or Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) / Tenzing Norgay Bus Terminus (Junction) – He will assist you for the forwarding journey to Aritar / Lingsey – From Bagdogra Airport (IXB) / New Jalpaiguri Railway Station (NJP) is at a distance of 110 kilometers aqnd is nearly 04 - 05 hours drive by road - Aritar in East Sikkim district of the Indian state of Sikkim is known for its natural and landscaped beauty  - Known for lush forest, mountains and rivers - The Aritar Lake (Ghati-Tso) is a nearby attraction, as are traditional villages and monasteries such as Lingsay - Lingsey is nearly 110 kilometers from Siliguri anfd is at an altitude of  4800 feet - Check into Hotel  / Home Stay - Back to Rongli for permit - Night stay at Lingsey or Aritar	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775455295/travelcrm/itineraries/days/aritar.jpg
c4a5a712-c51d-499e-9786-7e3a0b8fb73c	8b17a394-37e4-4354-b4a4-48baa5d4a1e7	2	ARITAR TO ZULUK TOUR	\N	 After breakfast, start for Zuluk Tour via Rongli Dam, Lingtam, Lingtam Monastery, Keukhela Falls, and finally reach zuluk.\r\n\r\nRongli [Altitude: 5200 ft.] - Rongli is an east Sikkim small township located on the bank of river Rongli. The inner line permit for visit towards Nathula granted over there.\r\n\r\nRongli Dam - The Rongli dam is a concrete dam on the Rongli river with a height of 41m and can hold 45,200 cubic meters of water.\r\n\r\nLingtam [Altitude 5082 ft.] - Lingtam is a small village next after the Rongli permit zone at an altitude of 5000 feet from sea level. It's known for his sun kissed peaceful weather surrounded by the hills of all it four sides. You can visit Lingtam Monestry also.\r\n\r\nKeukhela Falls - The Keukhela falls or Kali Khola falls located on the way of the old silk route in between Lingtam and Padamchen. This fall is 100m in heights and beautifully surrounded by scenic nature. Reach zuluk before lunch.\r\n\r\nZuluk [Altitude: 7000 ft.] - A small village in East Sikkim, part of Old Silk Route 10000 ft. above the sea level gaining popularity amongst the tourists because of its natural virginity, unspoiled nature and amazing Himalayan beauty. Catching a glimpse of the snow capped mountain ranges or sun rising on the sea from the window of the hotel room is something that you might have experienced a lot of times. Overnight stay at Zuluk Homestay	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775455394/travelcrm/itineraries/days/aritar1.webp
d27c428c-1963-4bb6-b1e2-56568758268c	8b17a394-37e4-4354-b4a4-48baa5d4a1e7	3	Zuluk Sightseeing – Tsomgo Lake – Baba Mandir - Gangtok	\N	After an early breakfast, proceed for Zuluk sightseeing, covering Thambi View Point, Lungthung View Point, Zig-Zag Road, and Kupup Lake . Later, drive towards Tsomgo (Changu) Lake to admire its serene beauty, followed by a visit to Baba Harbhajan Singh Mandir. Nathula Pass can be visited on this day subject to permit availability and weather conditions (optional and at extra cost). After sightseeing, continue your drive to Gangtok. On arrival, check in to the hotel and enjoy an overnight stay at Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
9bc94793-27c6-4a9b-b4dc-299b2b726c50	8b17a394-37e4-4354-b4a4-48baa5d4a1e7	4	Gangtok- (Full Day Local Sight Seeing)	\N	Today, it’s all about Gangtok and its awe-inspiring sights.\r\nBakthang Waterfall\r\nAt the distance of 3 km from Gangtok, Bakthang Waterfall will be your first stop which is an eye-catching attraction that no tourist ever want to miss. Flowing from Ratey Chu, it is a broad waterfall that creates a soothing environment for the visitors to enjoy.\r\nTashi Viewpoint\r\nSubsequently, you can observe the glorious Himalayas from Tashi Viewpoint that will be your binocular to scrutinise the seeking view of snow peaks. Moreover, keep your camera’s panoramic setting on because this is the right spot to capture the entire beauteous landscape.\r\nGanesh Tok\r\nJust wish that it’s a clear day because it’s only on the bright clear days that you can have the most awesome view of the place. Apart from Tashi View Point, Ganesh Tok is the place from where you can have a spectacular view of Gangtok. It is an ancient temple of Lord Ganesha that has a pleasant aura. This place welcomes you through its brilliant entrance, and as you swirl the sights, you will see colourful buntings surrounding the temple.\r\nEnchey Monastery\r\nYour next destination of the day is a 200 years old monastery which was initially established as a small gompa by a tantric artist and renowned exponent among highlander Buddhists, Lama DrupthobKarpo. Enchey Monastery literally means “the Solitary Temple” which now is home to almost 90 monks. Tourists are quite fascinated by the place because it accommodates a number of religious objects and presents Tibetan culture in a beguiling manner.\r\nDirectorate of Handicraft and Handloom\r\nNow, it is time for you to admire the local art and talent depicted through the Handicrafts in this Directorate which is located at the ‘Zero’ point of the city. Here you can buy the majestic artefacts such as Thanka painting, traditional carpets, wooden carved and colourfully painted sculptures and much more. Do DrulChorten Stupa\r\nStanding proudly on the hill Hock, Do DrulChorten, also known as Phurba, is your next station which is also the biggest stupa of Sikkim. This shrine was constructed in 1945 and is encircled with 108 prayer wheels from which visitors gain divine blessings.\r\nInstitute of Tibetology\r\nAfter your spiritual tour, it is time for you to grasp some cultural and educative values of Tibet. One of the most significant institutions of the world, the Institute of Tibetology is that centre where many scholars research on the Tibetan language and tradition. Furthermore, you can know more about Life-at-Tibet through valuable material kept in the museum and Tibetan library that has preserved innumerable rich collections of the studies.\r\nFlower Show\r\nAs an integral part of aesthetic festivity, the locals of Gangtok organise a celebration in the name of Sikkim’s diverse vegetation. The flower show is the International Flower Festival which is celebrated every peak season of blooming. In the fete, the perfect blend of Gangtok’s topography is mirrored when breathtaking blossoms are showcased at a place from every corner of Sikkim. This is a must-visit and stupendous moment for every nature lover. \r\nRopeway & Banjhakri Falls\r\nLast but not the least, you will be enthralled by the bounteous attractiveness of the place when you will travel through Ropeway to reach Banjhakri Falls which is 70 ft tall waterfall surrounded by lush greenery of dense forest. This waterfall ascribes the natives because of their belief that it has all the healing and magical power like any other sacred place.After a busy and most memorable day of your trip, you will be taken back to your hotel where you can enjoy hot and appetising dinner. Spend overnight in your warm room because tomorrow you will visit some more astounding places.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456456/travelcrm/itineraries/days/gangtok.jpg
a44146b8-3a0a-4a21-9adc-fec9c3a1f70a	8b17a394-37e4-4354-b4a4-48baa5d4a1e7	5	Gangtok to Pelling Via Ravangla 	\N	Start Day with a heavy breakfast as this day awaits travelling and sightseeing umpteen. On your journey to Pelling you will come across various sightseeing destinations of Ravangla.Our representatives will pick you up from the hotel in the morning and drive you to Pelling. Pelling is a tiny hamlet town in west Sikkim. On your way to Pelling,   After some time here, you will head to Ravangla. Here, you can spend time sightseeing the popular Buddha Park and Temi Tea Gardens. Ravangla offers a scenic view of the Greater Himalayas. Once that’s done, you will arrive at your hotel in Pelling. Enjoy a hearty meal and take a goodnight rest as you look forward to what tomorrow has in store.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456546/travelcrm/itineraries/days/Ravangla.webp
3cbe4703-6ecb-4129-afb3-1669dd917781	8b17a394-37e4-4354-b4a4-48baa5d4a1e7	6	Full Day Local Sightseeing in Pelling	\N	Give this day an early start with some toothsome breakfast and prepare for local sightseeing in Pelling.\r\n\r\nFirst, head to the Darap Valley. This little hamlet is a perfect picnic spot where you can interact with the locals and take a glimpse into the Sikkimese lifestyle. The local villagers are very warm and friendly and you will enjoy your time spending it in their embrace.\r\n\r\nNext, visit the Rimbi waterfalls and the Kanchenjunga waterfalls. These perennial waterfalls provide refreshment to the mind, body and soul and are one of the major tourist attractions of the town. It is also a major spot for recreational activities like fishing.\r\n\r\nThen, move ahead and visit the Rock Garden and the Khecheopalri Lake. The Rock Garden is studded with gardens and pools and a small stream runs within it. You must take a walk on its meandering footpaths.\r\n\r\nThe Khecheopalri Lake, on another hand, is presumed to be one of the most sacred lakes in Pelling. It is placid, picturesque and a clean water body with no leaves floating over even though it is set amidst a thick bushy forest.\r\n\r\nLastly, visit the Rabdentse Ruins, Pema Yangtse monastery and Helipad Ground. The Rabdentse ruins speak volumes about Sikkim’s glorious past. It is a must see site for archaeological and history lovers.\r\n\r\nThe Pema Yangtse is at a walking distance from here and offers splendid views of the Kanchenjunga ranges. The Helipad ground is also another popular viewing spot to behold the splendid views of the snow-capped ranges. The view of the sunset here is like something you must have never witnessed.\r\n\r\nReturn to the hotel in the evening and stay overnight in Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
494c5f49-f88c-4636-a32d-062b1b5edf5a	8b17a394-37e4-4354-b4a4-48baa5d4a1e7	7	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
539dfec0-72bc-4595-bb54-53d41d16b2d6	f5d551b1-647c-476c-95f9-5036db31e6fa	5	Gangtok to Pelling Via Ravangla 	\N	Start Day with a heavy breakfast as this day awaits travelling and sightseeing umpteen. On your journey to Pelling you will come across various sightseeing destinations of Ravangla.Our representatives will pick you up from the hotel in the morning and drive you to Pelling. Pelling is a tiny hamlet town in west Sikkim. On your way to Pelling,   After some time here, you will head to Ravangla. Here, you can spend time sightseeing the popular Buddha Park and Temi Tea Gardens. Ravangla offers a scenic view of the Greater Himalayas. Once that’s done, you will arrive at your hotel in Pelling. Enjoy a hearty meal and take a goodnight rest as you look forward to what tomorrow has in store.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456546/travelcrm/itineraries/days/Ravangla.webp
264328e1-4ea6-4096-b57d-827f760c5351	f5d551b1-647c-476c-95f9-5036db31e6fa	7	Pelling to NJP / IXB Airport Drop	\N	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
dd618a04-424e-4f8f-a4d9-c0450d84359c	020dd189-7e3a-41c7-b01d-04d81c323449	1	Day 1	\N	\N	\N
6d5379eb-1862-41fe-8dab-8fc9e628b7ee	020dd189-7e3a-41c7-b01d-04d81c323449	2	\N	\N	\N	\N
384f3a70-c5f7-4be4-82c9-62a448af3af9	f5d551b1-647c-476c-95f9-5036db31e6fa	8	\N	\N	\N	\N
9ec578ea-7ad0-4316-94d3-f6260c3d0317	ca7cf7bc-765d-4fea-8963-d5c0b5273f1a	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
8fb4576b-640f-48d6-a7ba-00da762a8a52	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165262/travelcrm/itineraries/days/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg
4887facf-1d48-4398-a104-ea19e2f99f53	ca7cf7bc-765d-4fea-8963-d5c0b5273f1a	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
18460f50-09f1-40ed-8e49-a3f2dfc205c7	99965787-2604-4fdc-b174-658d85ceb93b	1	Day 1	\N	\N	\N
112e1e6c-9989-433e-8141-946bbd985cf1	bb600f5c-f403-4356-9f85-4b3c02bb5523	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
bf28fa25-2c1e-416e-a789-e53922d8932b	83f4406f-5799-4252-a7b7-8718a9e49530	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
34469114-05d7-439d-96ac-3c9d8efe2017	83f4406f-5799-4252-a7b7-8718a9e49530	5	Pelling to NJP / IXB Airport Drop	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
f588467a-7e5a-4634-9d9b-c6502c0f752b	bb600f5c-f403-4356-9f85-4b3c02bb5523	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165262/travelcrm/itineraries/days/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg
63d58274-be94-47da-a8ad-c1fe8a6832e9	bb600f5c-f403-4356-9f85-4b3c02bb5523	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775190080/travelcrm/gallery/ynfildudeak04xhvj2sg.jpg
c7079e14-8eb3-46fe-88c5-a77169b897c6	bb600f5c-f403-4356-9f85-4b3c02bb5523	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165586/travelcrm/itineraries/days/pexels-bliss-30156563.jpg
c4697cac-eb48-4853-baaf-444dbf09cdeb	bb600f5c-f403-4356-9f85-4b3c02bb5523	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165555/travelcrm/itineraries/days/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg
6113b4a4-319c-4f02-a71d-567d7a496000	bb600f5c-f403-4356-9f85-4b3c02bb5523	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165277/travelcrm/itineraries/days/240_F_227328395_qU4xDeIcMECqBm2dmEEI0bcQdHpCKw40.jpg
cbce2654-7b49-4c6b-800e-789f03b7e81d	bb600f5c-f403-4356-9f85-4b3c02bb5523	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
1e93b880-03d4-485c-8fa1-978691122056	f21339a4-bf54-44b7-acc2-06d29fed6f9d	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
d3d4c91c-8f5b-469f-a140-70b74cd8606b	f21339a4-bf54-44b7-acc2-06d29fed6f9d	3	Gangtok to Pelling Via Namchi	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
4727720d-c66b-4111-863d-eb85242b5c8e	f21339a4-bf54-44b7-acc2-06d29fed6f9d	4	Pelling Full Day Sightseeing 	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
acaa11d4-4abd-4ada-96eb-8ef2f28098a9	f21339a4-bf54-44b7-acc2-06d29fed6f9d	5	Pelling to NJP / IXB Airport Drop	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
0f6f6f00-7222-4d05-ae50-2c4ac227b7bc	f21339a4-bf54-44b7-acc2-06d29fed6f9d	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg
ef769eb4-12b6-4176-8e42-dce4ba82b947	83f4406f-5799-4252-a7b7-8718a9e49530	4	Pelling Full Day Sightseeing 	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
b4211ab2-57ca-4165-82f3-e6a5c2c969a4	0dc216b0-2e16-496d-ac8c-3650bef26fc5	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
101d0d4e-11d1-4d40-a842-4263e22e290d	0dc216b0-2e16-496d-ac8c-3650bef26fc5	3	Gangtok to Pelling Via Namchi	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
cffe2908-fd76-4979-9943-e8d3e164261a	0dc216b0-2e16-496d-ac8c-3650bef26fc5	4	Pelling Full Day Sightseeing 	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
f475ca16-bb9e-49a1-aa0d-e2ae8d2c1bef	0dc216b0-2e16-496d-ac8c-3650bef26fc5	5	Pelling to NJP / IXB Airport Drop	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
252f2b48-8d2f-4329-a084-770bb4252ede	19a94c0f-bb35-46bb-9625-756af72ca8e5	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
a2e008c0-c27f-4181-ac6f-95e7e360846a	f8cdf0c6-8f94-4844-8dd7-82952db885f7	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1776084560/travelcrm/gallery/crcx1ujmc9re3grgpup1.jpg
044c677d-ce79-4553-9e46-b4a287fb6f8d	19a94c0f-bb35-46bb-9625-756af72ca8e5	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
c0cbb608-d236-4483-aa48-d9fccff5ae18	19a94c0f-bb35-46bb-9625-756af72ca8e5	3	Gangtok to Pelling Via Namchi	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
51c0cf01-e173-457e-9dd7-ef4fb311ab2f	19a94c0f-bb35-46bb-9625-756af72ca8e5	4	Pelling Full Day Sightseeing 	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
b6f5940f-89e0-40cf-9c16-508ff5825302	19a94c0f-bb35-46bb-9625-756af72ca8e5	5	Pelling to NJP / IXB Airport Drop	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
e10c6129-c3db-4752-9e38-8be2d976db83	0ad965a6-cdb0-4dbb-b594-4ac2070cbe58	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
fc85dc41-8e8a-40fc-b14d-dd5592149079	0ad965a6-cdb0-4dbb-b594-4ac2070cbe58	4	Pelling Full Day Sightseeing 	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
73bdc593-5778-4f56-bb33-31618f562630	0ad965a6-cdb0-4dbb-b594-4ac2070cbe58	5	Pelling to NJP / IXB Airport Drop	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
e07b2bef-9b28-47e5-8228-fd466457fbd4	0ad965a6-cdb0-4dbb-b594-4ac2070cbe58	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775819570/crm-masters/galleryImages/wk3dr8qmnweakli2n8la.jpg
24615b06-bd98-4dd9-82c0-3b78dec28869	f8cdf0c6-8f94-4844-8dd7-82952db885f7	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	3134f29d-8635-411f-a6dd-c2562eb7314d	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775751601/travelcrm/gallery/tm5vtag0blw4pbdxrypc.jpg
51a813db-3844-4a41-b461-7e5086049ff5	66a1d196-8590-4897-8a8e-fe404278dad9	7	\N	\N	\N	\N
116fd2df-241e-4430-a597-4158195b898e	66a1d196-8590-4897-8a8e-fe404278dad9	1	Day 1 - NJP → Aritar	429c09c0-d14a-4a9a-9f06-7b43981e5e13	Pickup from NJP/Siliguri\nTransfer to Aritar\nEn-route sightseeing:\nAritar Viewpoint\nLampokhari Lake (Aritar Lake)\nCheck-in & overnight stay at Aritar	\N
3bf74933-55fb-4185-8f21-9f980401ed9a	f8cdf0c6-8f94-4844-8dd7-82952db885f7	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165586/travelcrm/itineraries/days/pexels-bliss-30156563.jpg
2b0ab267-04cf-43a4-a393-59247e377ffc	66a1d196-8590-4897-8a8e-fe404278dad9	6	\N	\N	\N	\N
f3232153-fc6d-47ae-ac3a-3ca12d6bc7b9	66a1d196-8590-4897-8a8e-fe404278dad9	4	Day 3 -  Gangtok Sightseeing	\N		\N
4abd43ab-41bc-4b16-86a3-888ea77a68b5	f8cdf0c6-8f94-4844-8dd7-82952db885f7	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165555/travelcrm/itineraries/days/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg
72180e07-2343-44f9-bf40-0fe545612d02	66a1d196-8590-4897-8a8e-fe404278dad9	5	Day 5 - Gangtok → Pelling (via Ravangla)	\N		\N
287a3b4f-a024-4f1f-8059-8f82553b828d	f8cdf0c6-8f94-4844-8dd7-82952db885f7	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165277/travelcrm/itineraries/days/240_F_227328395_qU4xDeIcMECqBm2dmEEI0bcQdHpCKw40.jpg
d1242fa5-ca80-4603-bc5b-e072a7a415a3	4ddd7eb2-9c79-42c1-a692-d8e585abfb41	1	Day 1	429c09c0-d14a-4a9a-9f06-7b43981e5e13	\N	\N
7479938b-77d0-4ff6-a113-921e8a352f5f	4ddd7eb2-9c79-42c1-a692-d8e585abfb41	2	\N	051f9729-4b94-4aaf-8811-29de0c2eb244	\N	\N
df634766-bfbd-4e2c-adbc-bb7e6d14b60f	4ddd7eb2-9c79-42c1-a692-d8e585abfb41	3	\N	3134f29d-8635-411f-a6dd-c2562eb7314d	\N	\N
8c069867-7b3f-428b-8f8c-6d07ad8a0190	e210a64a-d41a-4dec-be58-0424db603e98	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
0c2fd92b-e8cf-4b40-b857-49ddf0e49276	e210a64a-d41a-4dec-be58-0424db603e98	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165262/travelcrm/itineraries/days/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg
51b883a2-58cb-4b5f-9b5c-54a6f6cc1abb	e210a64a-d41a-4dec-be58-0424db603e98	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775190080/travelcrm/gallery/ynfildudeak04xhvj2sg.jpg
3725c8bf-7092-410b-91d5-5c792a5c6aaf	e210a64a-d41a-4dec-be58-0424db603e98	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165586/travelcrm/itineraries/days/pexels-bliss-30156563.jpg
093feaeb-f75f-4b16-8079-328d345d23b2	80b8e518-e306-4a15-a6a5-d06fbf2ddedc	1	Day 1	3134f29d-8635-411f-a6dd-c2562eb7314d	\N	\N
8c7d50bc-444a-475f-a95e-3e02716332c3	80b8e518-e306-4a15-a6a5-d06fbf2ddedc	3	\N	\N	\N	\N
cf3522c6-fd22-4961-8bc9-f00fe5ce26b4	80b8e518-e306-4a15-a6a5-d06fbf2ddedc	2	\N	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	\N	\N
290a360e-a083-4035-841d-12079c0e3a9b	0ad965a6-cdb0-4dbb-b594-4ac2070cbe58	3	Gangtok to Pelling Via Namchi	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
5374fb77-87bf-4bf5-b932-f1104c3905db	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	8	\N	\N	\N	\N
45f65cbe-5902-4452-9406-253d74122046	f8cdf0c6-8f94-4844-8dd7-82952db885f7	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
be77d6da-c59c-41d4-b66b-01b9326c7826	f8cdf0c6-8f94-4844-8dd7-82952db885f7	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165262/travelcrm/itineraries/days/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg
6d2cbf3d-9cea-4179-b9b6-777c954b0ece	83f4406f-5799-4252-a7b7-8718a9e49530	3	Gangtok to Pelling Via Namchi	429c09c0-d14a-4a9a-9f06-7b43981e5e13	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
008245fc-d439-4d51-8526-d4a669e789e9	e54911c0-eaeb-4eea-beeb-41f89dd7e434	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
ba7916c1-49b0-49c8-b3b2-882323268337	e17bcc9c-a96b-4ff0-a403-393c07ea7d8d	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165586/travelcrm/itineraries/days/pexels-bliss-30156563.jpg
d6db6260-3efb-4f30-83b2-f3cc48d58375	e54911c0-eaeb-4eea-beeb-41f89dd7e434	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165262/travelcrm/itineraries/days/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg
7d76176d-c3e8-47cc-98c7-65c42baf823c	e54911c0-eaeb-4eea-beeb-41f89dd7e434	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775190080/travelcrm/gallery/ynfildudeak04xhvj2sg.jpg
7f42481a-3e8a-4633-ba33-1db060f8067e	e54911c0-eaeb-4eea-beeb-41f89dd7e434	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165586/travelcrm/itineraries/days/pexels-bliss-30156563.jpg
22182a78-df09-47b5-aeb2-125d1898d7fa	e54911c0-eaeb-4eea-beeb-41f89dd7e434	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165555/travelcrm/itineraries/days/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg
f7447e68-e9af-4ed6-af9e-3184038ef0dd	e54911c0-eaeb-4eea-beeb-41f89dd7e434	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165277/travelcrm/itineraries/days/240_F_227328395_qU4xDeIcMECqBm2dmEEI0bcQdHpCKw40.jpg
7def3f96-b6db-40db-8b11-e41aab815830	e54911c0-eaeb-4eea-beeb-41f89dd7e434	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
c09d9738-e05e-4520-9ec6-057304eea3e5	e54911c0-eaeb-4eea-beeb-41f89dd7e434	8	\N	\N	\N	\N
39ced2be-5957-4fd6-a804-09c40d31a5a2	21deb578-3d51-428c-bb96-b0705a0ee168	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
cdbc4412-d728-46ce-a4b3-19d7874a0348	21deb578-3d51-428c-bb96-b0705a0ee168	2	Gangtok (Tsomgo Lake(Changu Lake)Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277189/travelcrm/gallery/gldguykc8ieoj70mdjip.jpg
31f9c35c-b8be-445f-9983-0af9c2a44fb8	21deb578-3d51-428c-bb96-b0705a0ee168	3	Gangtok to Pelling Via Namchi	429c09c0-d14a-4a9a-9f06-7b43981e5e13	After breakfast, check out from your hotel in Gangtok around 8:30 AM and begin your scenic drive towards Pelling. On the way, visit Namchi, the cultural and spiritual capital of South Sikkim. Your first stop can be at Samdruptse Hill, which houses a towering 135-foot statue of Guru Padmasambhava (Guru Rinpoche) and offers a mesmerizing view of the surrounding hills. Next, proceed to Char Dham (Siddhesvara Dham), a magnificent pilgrimage complex featuring replicas of India’s four sacred Dhams — Badrinath, Dwarka, Puri, and Rameshwaram — along with a majestic statue of Lord Shiva. You can also visit the Namchi Rock Garden, a beautifully landscaped garden filled with flowers and fountains. If time permits, take a short detour to the Temi Tea Garden, the only tea estate in Sikkim, where you can enjoy tea tasting amidst stunning mountain views. After sightseeing, enjoy lunch at a local restaurant in Namchi and continue your drive towards Pelling. The journey from Namchi to Pelling takes about 2.5 to 3 hours, passing through lush valleys, orange orchards, and charming mountain villages. Arrive in Pelling by evening around 7:00 PM, check into your hotel, and spend the rest of the evening at leisure. Dinner and overnight stay will be at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg
da06d2d0-a6fc-4116-98da-0aa63c9544b8	21deb578-3d51-428c-bb96-b0705a0ee168	4	Pelling Full Day Sightseeing 	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, proceed for a half-day sightseeing tour of Pelling. Visit the famous Sky Walk, offering a thrilling experience with a breathtaking view of the Chenrezig statue and the surrounding mountains. Continue to Rimbi Waterfalls, a beautiful cascading fall ideal for short photography breaks. Next, explore the ancient Rabdentse Ruins, the archaeological remains of the former capital of the Kingdom of Sikkim, surrounded by lush forests and scenic trails. Finally, visit Darap Village, a traditional Sikkimese village known for its serene landscapes and warm local hospitality.\n\nAfter completing the sightseeing, start your drive towards Darjeeling, enjoying the picturesque journey through winding mountain roads. On arrival, check in to your hotel and relax.\n\nOvernight stay at Pelling.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg
9d03b24f-5e47-48e8-82f2-8f20a7d58b03	21deb578-3d51-428c-bb96-b0705a0ee168	5	Pelling to NJP / IXB Airport Drop	699dcf21-0624-48a9-a1fe-c21db084d708	After breakfast, check out from the hotel in Pelling and begin your journey towards New Jalpaiguri (NJP). The drive takes around 5 to 6 hours, passing through the scenic valleys, winding mountain roads, and charming villages of West Sikkim. En route, you can enjoy the serene beauty of rivers, lush green hills, and local life along the way. Upon arrival at NJP Railway Station, you will be dropped off for your onward journey with wonderful memories of your Sikkim trip.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg
7130b0e3-b54d-4120-9f14-bcb0760c233f	20c3aa9b-b85b-4be5-970f-21fc668f569b	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
c1852ff3-77de-40b5-ba5d-919e5fd2377f	20c3aa9b-b85b-4be5-970f-21fc668f569b	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165262/travelcrm/itineraries/days/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg
4e9c92be-a3bb-4c07-b28c-c79c435b2e44	20c3aa9b-b85b-4be5-970f-21fc668f569b	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775190080/travelcrm/gallery/ynfildudeak04xhvj2sg.jpg
8ad6f79e-60a5-4ee7-a530-16a9aacf963d	20c3aa9b-b85b-4be5-970f-21fc668f569b	4	Lachen –  Gurudongmar Lake – Chopta Valley  Excursion – Lachung	c32d5d30-f52a-4283-ba0f-d1834e3394c5	As the sun comes out and shines brighter, wake up, have your breakfast, and make a move towards the Gurudongmar Lake which is 2-3 hours away from Lachen. One of the highest altitude lakes, this lake is nearest to Tibet border. With snowy mountains in the background, this lake freezes when the winters knock in between December and April. Except for these months, the lake breathes a fresh air with colourful flora around it in summers. The lake is also considered holy by the Hindus, Buddhists, and Sikhs. It is said to be blessed with the child granting power to the issueless couples. After you are done with Gurudongmar Lake head back to your hotel for lunch.\r\n\r\nNow it’s time to leave Lachen and visit Lachung. Pack your bags, and you are all set for your next location on your way to Lachung which is the Chopta Valley. Settled in an incredibly calm and composed environment this place is best to sit for hours and do nothing but chat with each other as you watch the majestic hill views and valleys intersecting with one another. Chopta is famous for trekking activities. Without the hustle bustle, it is a tourist spot for people who wish to travel with the least crowd possible. And what better place than this could be for a honeymoon couple? Up next is Thangu, the most picturesque location in the Northern Sikkim. As it is located on a high altitude, most of the times you would find it under the snow cover. Flanked by the river Teesta and alpine meadows, it indeed is a heavenly place to be at. You are to get some amazing couple shots in Thangu.\r\n\r\nFinally, after a day full of exploring and long drives, you will reach Lachung. Check in at the hotel. Rest for some time, have some food, gather some energy and leave for one of the oldest monasteries in Sikkim, the Lachung Monastery. Spend some time here and garner all the positivity pointed at you in the monastery. Post your visit to the spiritual place, return to your hotel and spend your night here in Lachung.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165586/travelcrm/itineraries/days/pexels-bliss-30156563.jpg
30997dd0-e9e3-44d7-99b1-fa81f9dbf586	20c3aa9b-b85b-4be5-970f-21fc668f569b	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165555/travelcrm/itineraries/days/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg
396065a1-a202-4460-ac81-6c2f13db743a	20c3aa9b-b85b-4be5-970f-21fc668f569b	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165277/travelcrm/itineraries/days/240_F_227328395_qU4xDeIcMECqBm2dmEEI0bcQdHpCKw40.jpg
e0a69676-2446-4e66-90a6-8fe2bb6069c0	20c3aa9b-b85b-4be5-970f-21fc668f569b	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
9eeccffa-6cc5-424d-9e4a-b631bd2b7357	20c3aa9b-b85b-4be5-970f-21fc668f569b	8	\N	699dcf21-0624-48a9-a1fe-c21db084d708	\N	\N
f2ae9986-273d-4267-8cc3-f5e4248abc07	e17bcc9c-a96b-4ff0-a403-393c07ea7d8d	1	DAY 1 : New Jalpaiguri Railway Station (NJP) / Bagdogra Airport (IXB) – Gangtok (130 km / 4 Hours Drive Approximately)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Your trip commences with arrival at the railway station or Bagdogra airport. Meet our representative who will escort you on to a scenic drive to Gangtok. The capital city Gangtok caters to the needs of all. Be it people seeking tranquillity or those who are looking for some adventure. Set at a height of 5480 feet, it is the most visited destination in India.\r\n\r\nEmbark on a road trip where you will be surrounded by varieties of rhododendron, orchids and colourfully delicate butterflies. Upon reaching the hotel, check in and relax. The rest of the day will be at your will to explore.\r\n\r\nMG Marg\r\nMG Marg is where you can take a stroll in the evening. It is a famous marketplace and you can shop for souvenirs and local artefacts. Make sure to add the religious paintings called Thankas, the Nepalese dresses, Tibetan carpets, stuff made from bamboo and cane, alpine cheese, hand-woven jackets and also some electronics.\r\n\r\nReturn back to the hotel and enjoy spending the overnight in the comfort of the hotel room in Gangtok.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
1ad5ad10-86cc-4c94-9e73-2a8358e7de1c	e17bcc9c-a96b-4ff0-a403-393c07ea7d8d	2	DAY 2  - \t Gangtok (Tsomgo Lake Excursion and Baba Mandir)	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Today is the day when your sweetness of love gets blended with some bold motifs. Have your breakfast and get ready for the Tsomgo Lake excursion. On your 40 km drive to Tsomgo, you will be accompanied by the Kyongnosla Alpine Sanctuary which houses the red panda and the blood pheasant. Besides these, you will find alpine trees and Rhododendron beautifying the roads that lead you to your final destination. It will take 2 hours for you to reach the lake. The moment you arrive the 50 feet deep lake, get your camera out because its time to capture some fantastic moments.\r\n\r\nSit beside the lake for some time. Sink in the freshness of the air. If you are lucky enough, you might also find Brahmini ducks and many migratory birds flying over and around the lake. Near to the lake is Baba Mandir which also is your second attraction of the day. The shrine is a memorial for the late 22 years Sepoy who counted his last breathe while he was saving mules. The soldiers who are posted in the nearby areas believe that his soul protects them by warning them about the upcoming danger. Seek his blessings so that your relation gets stronger in the coming years.\r\n\r\nWe also have an optional tour of Nathu La pass which can be taken at extra charges after covering the above-mentioned tourist places. This pass used to serve as the Silk Route in the bygone days. Special permits are required to enter this area. If you do not wish to take this exclusive tour head back to the hotel post visiting the Baba Harbhajan Mandir. The evening is free to roam. Go strolling the cultural streets of Gangtok. Have a romantic dinner and return to the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165262/travelcrm/itineraries/days/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg
d11e45ae-7d74-42ab-acb6-96a268bc4a0a	e17bcc9c-a96b-4ff0-a403-393c07ea7d8d	3	 Gangtok – Lachen (About 125 Kms / 6 Hrs)	4dfa39c3-634b-49b9-a043-3cf3403e63bf	Today we’ll be leaving Gangtok for Lachen which is around 5-6 hours drive away from the capital city of Sikkim. Check all your belongings carefully, have your breakfast and start your drive to Lachen. After covering 96 kilometres, you will reach Chungthang. Take a halt and have your lunch here. Post hogging on the tasteful food; resume your journey to Lachen.\r\n\r\nThe snow-capped peaks, Chopta Valley, Gurudongmar Lake, and untouched flora and fauna of Lachen will add seven stars to your honeymoon. The enchanting beauty of the place will leave you with no suitable words to define it. As soon as you reach Lachen, check in at the hotel. Have your welcome tea, take some rest and afterwards visit Lepcha Village, a tiny hamlet perfect for evening walks. Spend some time full of romance and never-ending talks while you walk through the little streets of Lachen. Get back to your hotel, have your dinner, and call it a day.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775190080/travelcrm/gallery/ynfildudeak04xhvj2sg.jpg
a84d523f-4df4-448c-9dfc-ad7648034211	e17bcc9c-a96b-4ff0-a403-393c07ea7d8d	5	Lachung – Yumthang Valley – (Optional Tour Zero point)	c32d5d30-f52a-4283-ba0f-d1834e3394c5	Start your journey early morning to capture the unparalleled beauty of the Yumthang Valley (11,800 ft) which is popularly known as the Valley of Flowers. The greenery punctuated with a variety of colourful flowers and trees makes this valley a famous attraction of Sikkim. The valley also boasts of a lovely river and grassy plains where you come across horses, yaks and goats grazing. This is such a picture-perfect view. Get back to the hotel in Lachung and enjoy an overnight stay.\r\n\r\nOptional Tour\r\nZero Point tour can be done on the same day at an additional cost.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165555/travelcrm/itineraries/days/Yumthang_valley-_Lachung_Sikkim_India_2012.jpg
c176b04a-8c50-496d-8742-9e60f68486ff	e17bcc9c-a96b-4ff0-a403-393c07ea7d8d	6	Lachung to Gangtok	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Post breakfast, check out from the hotel and we will drive you back to gangtok, On the way back you will come across Twin and Bheema waterfalls. \r\nAfter an exciting day, reach Gangtok and check in at the hotel. Spend the overnight in the hotel.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165277/travelcrm/itineraries/days/240_F_227328395_qU4xDeIcMECqBm2dmEEI0bcQdHpCKw40.jpg
cdd7a52b-6d1f-458c-8974-c6e9f14e461f	e17bcc9c-a96b-4ff0-a403-393c07ea7d8d	7	Gangtok – New Jalpaiguri Railway Station (NJP) / Bagdogra 	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	Airport (IXB) (130 km / 4 Hours Drive Approximately)\r\nThis is the last day of the Sikkim holiday package. After devouring on some healthy breakfast, complete all the necessary check out procedures. Transfers to the railway station or airport will be arranged as per your travel plan and you will board your flight back home. We hope you and your companions enjoyed our assistance and will let us serve you again.	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775165289/travelcrm/itineraries/days/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg
\.


--
-- TOC entry 4293 (class 0 OID 25849)
-- Dependencies: 269
-- Data for Name: itinerary_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.itinerary_events (id, day_id, type, title, description, start_time, end_time, cost, image_url, metadata, sort_order) FROM stdin;
be055021-272a-45e0-af8a-6ab89742393d	000e72b0-6e0b-4f12-9852-55d553c5bba1	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
96e0a7f0-81a2-4d43-8a55-d6b8f391e288	b7bc2fd0-8ba9-44aa-8593-f97e896a1555	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
f5c765b8-e024-4a1f-80c9-0aa992564a9f	000e72b0-6e0b-4f12-9852-55d553c5bba1	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
596bbdfb-11a6-4cbc-a722-8b89cc9600db	4bc54e19-6f49-48ef-b012-63dbd71f6e03	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
b6b0e4f8-a375-41db-962e-c80797c44323	2ed4785c-41cd-40fc-9718-fc29f7729c85	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
72023d90-5654-4c41-a55e-fe93920795ba	2ed4785c-41cd-40fc-9718-fc29f7729c85	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
6ee3f377-d312-4e76-8253-04118d114127	4edb5e46-312e-41c3-96e0-d243241a55c7	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
c989ea10-5adb-4afd-85bd-85a84709f383	4edb5e46-312e-41c3-96e0-d243241a55c7	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
82c95720-de0e-46b3-a227-daf69f5a78d3	97c2a959-f777-4674-a361-c32c9fbde836	transport	Transport	\N	\N	\N	\N	\N	null	1
2ecdcb00-0b31-41aa-95f9-321b830a388e	b7bc2fd0-8ba9-44aa-8593-f97e896a1555	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-04", "checkOutDate": "2026-04-06"}	2
b4243a8c-9e55-4db9-88a9-b062b9fdd2f9	56f9c834-935e-4686-8a9b-3f7236c608fc	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
b86ff492-8251-4174-862b-bbcd0da4b73d	c50ce5cb-9956-44a8-a365-5879666445d6	transport	Transport	\N	\N	\N	\N	\N	null	1
ac6dd18b-08e5-4a16-9c87-a1bbdd1be8f7	ae7dca7f-73b2-4dc6-9a7a-910e77986600	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
533abb8a-3fd8-4419-a899-119cf9f4e9b1	ae7dca7f-73b2-4dc6-9a7a-910e77986600	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-04", "checkOutDate": "2026-04-06"}	2
dfec0bd1-1d58-4e3f-b561-38aed98f1427	64554acd-90b9-4df7-943c-51fb4052090d	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
386fe80e-d618-4967-86b3-7474f1b0cfd9	b249a209-a940-40d0-817b-80ce09e0636b	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
5c02d7c1-a356-4c7d-a3bd-52d7a5c8f12e	b249a209-a940-40d0-817b-80ce09e0636b	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
cfff03fb-aa28-4781-bfbc-f7105c149fed	f0759e4e-7ae7-4cdf-8edf-d522079c36a5	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
1717225b-1fe1-4227-b649-eb6ca81500ac	64554acd-90b9-4df7-943c-51fb4052090d	accommodation	Hotel Potala	\N	\N	\N	500.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775176544/travelcrm/itineraries/events/1717225b-1fe1-4227-b649-eb6ca81500ac/photo-1582719478250-c89cae4dc85b.avif	{"id": "f30630f0-93f8-4a3d-b3bf-1734e07a6514", "name": "Hotel Potala", "category": "3 star", "imageUrl": null, "isActive": true, "masterId": "f30630f0-93f8-4a3d-b3bf-1734e07a6514", "basePrice": "500", "masterType": "hotels", "destination": {"name": "Gangtok"}, "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	3
ca464acb-38a9-4174-b33a-6cd533e747f8	747da3cc-002a-42df-8ff0-cfbdce309a47	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
7070db02-3be5-4c1b-940f-249a926185d5	747da3cc-002a-42df-8ff0-cfbdce309a47	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
be3cf081-201c-49a9-982f-79132fd1e046	daf83dfd-a3ec-422e-99cb-d487f318e762	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
ba557b77-f15c-4aeb-a13c-0b16a1161a4c	daf83dfd-a3ec-422e-99cb-d487f318e762	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
814fec0d-c303-4916-aa9e-99281c45436f	f0759e4e-7ae7-4cdf-8edf-d522079c36a5	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
5aa1eade-dba7-40b4-9c1d-b9606c71413b	4f26a037-98b4-4abb-a999-970a6195b149	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
f201df69-fab0-4581-a50d-9af08e2769d0	4f26a037-98b4-4abb-a999-970a6195b149	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
738679c5-9b3a-4b27-be39-dbf128d19a21	80c54f85-5059-474f-a971-e888bdbad749	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
a6076fae-0a23-4d29-bfb8-bb68a4d8b5cc	80c54f85-5059-474f-a971-e888bdbad749	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
88f31ded-a620-4f3b-aaf3-da73ab98e115	4bc54e19-6f49-48ef-b012-63dbd71f6e03	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
f9f02d16-2542-4b3a-ac02-fddf6aa5a20a	273cc930-c921-4466-bcb0-19120b8ac39d	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
b8d6439d-bc24-420c-8d80-764089ceaccd	d6afdf13-02d4-4e2f-9b37-d1eef6046200	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
3884f2e8-56e2-4ca8-b08a-ef1737db1869	d6afdf13-02d4-4e2f-9b37-d1eef6046200	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
7d169caf-3143-47c7-a656-7580899d7725	a8a73654-ba9b-4185-a145-18d69bb6cbd4	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
ea08ded1-3ba8-4bca-87d6-b256233a8147	a8a73654-ba9b-4185-a145-18d69bb6cbd4	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-04", "checkOutDate": "2026-04-06"}	2
39275217-7c2f-43be-8ce4-9de1dc680f09	2c71142d-e390-474a-83b9-393d27cef134	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
fb7c6849-9c02-403d-ac05-1b50d26db95e	cbb78974-985f-4270-ae12-d994b72b53d0	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
54396f14-78d9-4a82-a183-40d9030905c5	cbb78974-985f-4270-ae12-d994b72b53d0	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-04", "checkOutDate": "2026-04-06"}	2
52d8081a-54b8-4c3e-b8a4-ebb1fb4e748e	a1a0ea54-2b29-4dfd-8c99-75cb5b050063	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
897a8670-58c1-487b-b82a-75d0587c6134	c66c7826-bd9c-44fd-9e9d-41fe6ed419b5	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
26dfaf84-48ad-4b5d-b229-08479d88beaa	c66c7826-bd9c-44fd-9e9d-41fe6ed419b5	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
f105474e-2b44-49d0-b4a2-43de31693a31	1f253ace-1e62-476d-a1ff-48bd29db43eb	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
19cfd9f6-48e8-4502-a29a-dcee6416eb81	1f253ace-1e62-476d-a1ff-48bd29db43eb	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-04", "checkOutDate": "2026-04-06"}	2
f28a6d38-c1b3-4ed6-ae41-02d5285cb355	e9bc868a-d229-4f0e-a8ca-5ae5b01ba949	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
f4cc939d-aa3f-4b02-9ef7-0ec689e19c7c	b44bf9c2-a986-4f7c-938d-4fd64d3f0bc1	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
c82cec27-ac07-430e-b8b8-66010f6b8578	b44bf9c2-a986-4f7c-938d-4fd64d3f0bc1	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-04", "checkOutDate": "2026-04-06"}	2
5b5f1a50-de68-4384-9d2d-25510f984d42	5c69159a-a4c6-466a-a68d-fbf54f801770	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
e077a0cb-08b9-48de-b938-4d29e6b8e359	acad8d7c-79f8-40fc-90e9-d15c54cf02a3	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
3ad1cc23-c297-4288-a092-7d6c78cf2e29	acad8d7c-79f8-40fc-90e9-d15c54cf02a3	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
f6c72d57-78c9-48cd-84f4-f6bcf88cd448	340610e0-7902-4937-9cf7-49088f028d18	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
0a671211-2cba-423c-b28a-c708991bd958	340610e0-7902-4937-9cf7-49088f028d18	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-04", "checkOutDate": "2026-04-06"}	2
7be4fecd-0356-4738-91d9-6018f13e7a12	0bc0e742-bbe5-411f-a843-390cc916e96a	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
6db6365e-d964-4253-828c-cfba172048a4	24cee3d5-4a35-4234-a28e-918ce7cacf50	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
1f8839a2-0047-4962-9c6a-8ffc019e0417	24cee3d5-4a35-4234-a28e-918ce7cacf50	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-04", "checkOutDate": "2026-04-06"}	2
a2e5e3ca-cd14-4030-9de7-0dc840e03498	2df45acf-0d6a-4661-b9f8-c38d9204e155	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
ab32e963-f911-4071-abec-1871b0b4dc98	cd104b3c-ac2d-4d18-a653-b5bf099ca545	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
fab1eb43-105e-4c6f-af6c-d240f26cc79d	cd104b3c-ac2d-4d18-a653-b5bf099ca545	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-04", "checkOutDate": "2026-04-06"}	2
7e5b8c81-76c7-4d8d-bb3e-94da589d3a1b	02143239-dd11-4d4d-9cf0-1f319f8dcd90	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
c8a18e66-eaa5-4995-b3fc-588ff4cebc3d	0d17e8e0-eaf8-4d7e-9491-a8a0b152a9ce	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
ec744a39-43db-4b9c-843b-a9283d3d4afa	0d17e8e0-eaf8-4d7e-9491-a8a0b152a9ce	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
cae385ba-f558-41cc-bb28-e6ab284ce098	9ec578ea-7ad0-4316-94d3-f6260c3d0317	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
3bbe2353-76ff-48b3-a127-c851be894720	4e3ea09f-3415-4550-bd7c-d413ef6da80d	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
8a43f294-af68-4c1c-aa95-bd6e41106eb2	9ec578ea-7ad0-4316-94d3-f6260c3d0317	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-14", "checkOutDate": "2026-04-15"}	2
5fed166a-7a52-446c-86a0-88e7f543024c	8e04d97a-94a7-4c58-9e38-15244e0edfc7	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456965/travelcrm/itineraries/events/5fed166a-7a52-446c-86a0-88e7f543024c/221_superior-white_fbfcff.avif	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
1aa29161-eac2-4d1a-8e5e-ad664c99c752	4e0bfd1c-c1aa-4ed1-a863-980cdd31d171	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456965/travelcrm/itineraries/events/5fed166a-7a52-446c-86a0-88e7f543024c/221_superior-white_fbfcff.avif	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
5c142fc4-82f6-404c-adb3-71fa34fce615	5da69795-d858-4974-9ca9-e370e03a8455	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456965/travelcrm/itineraries/events/5fed166a-7a52-446c-86a0-88e7f543024c/221_superior-white_fbfcff.avif	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
66f79f57-e500-4972-927c-b7e7cbbcaaf7	116c6073-3932-4b99-bb27-846361660cdb	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456965/travelcrm/itineraries/events/5fed166a-7a52-446c-86a0-88e7f543024c/221_superior-white_fbfcff.avif	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
1e17e3b1-b318-45dc-8ed9-aec77733e891	0f6f6f00-7222-4d05-ae50-2c4ac227b7bc	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279137/travelcrm/gallery/q6pohdpra3wqit53qq51.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-14", "checkOutDate": "2026-04-15"}	2
612478cb-8d79-4452-8ca6-b155a517a390	0f6f6f00-7222-4d05-ae50-2c4ac227b7bc	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278879/travelcrm/gallery/yrm8jxruvmkmxjsxll4f.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
f8af6056-8940-4788-b22b-55e4720a109d	8e04d97a-94a7-4c58-9e38-15244e0edfc7	accommodation	Accommodation		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279417/travelcrm/gallery/pnnsz8akm5d13a5ojetc.jpg	{"checkInDate": "2026-04-15", "checkOutDate": "2026-04-16"}	2
71e24e66-0eef-4dd6-a27a-20590b963e60	176741aa-c900-49ca-994f-29d75ff2e169	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
ece6a218-1fb9-4dae-9d59-fb07a6f1b4f7	176741aa-c900-49ca-994f-29d75ff2e169	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-14", "checkOutDate": "2026-04-15"}	2
7510b109-82c6-46ba-9ad6-8f5c1ed218bb	6d2cbf3d-9cea-4179-b9b6-777c954b0ece	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
6de0878b-2382-4f16-bbbb-1355184be4d4	112e1e6c-9989-433e-8141-946bbd985cf1	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
ce3566a9-1250-44f3-9dc0-07085fd82b15	112e1e6c-9989-433e-8141-946bbd985cf1	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
881ca080-87a5-4b37-9c30-81c63995f91a	d3d4c91c-8f5b-469f-a140-70b74cd8606b	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
d7e380bc-72b0-4ef8-b7b4-ca974a05e05f	e2a142b5-f3c2-4587-ae76-d077edb7ee2f	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
d9e58006-34e3-4357-8c7e-8cb92d358e96	e2a142b5-f3c2-4587-ae76-d077edb7ee2f	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-14", "checkOutDate": "2026-04-15"}	2
df28de97-2832-4493-aa41-3d3b4b87abb8	101d0d4e-11d1-4d40-a842-4263e22e290d	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
efd15aa2-dc19-4ac8-9a67-ed7e79df007f	252f2b48-8d2f-4329-a084-770bb4252ede	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
26ccd934-c909-489e-b123-09b2c963cbdf	252f2b48-8d2f-4329-a084-770bb4252ede	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-14", "checkOutDate": "2026-04-15"}	2
501346af-701a-4a7c-b14e-cad4dfa9c108	c0cbb608-d236-4483-aa48-d9fccff5ae18	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
24fa50b6-bfd8-4cb5-96ee-52636909f7c5	e07b2bef-9b28-47e5-8228-fd466457fbd4	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
48b65adb-5bbd-4b82-87af-9060f1e3b02c	e07b2bef-9b28-47e5-8228-fd466457fbd4	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-14", "checkOutDate": "2026-04-15"}	2
987f6377-8fac-4058-a8a2-e135b6ec0e77	45f65cbe-5902-4452-9406-253d74122046	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278879/travelcrm/gallery/yrm8jxruvmkmxjsxll4f.jpg	{}	1
d125b1a5-a62f-4aca-a07d-6dc18e829127	8c069867-7b3f-428b-8f8c-6d07ad8a0190	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
928040bd-6f4c-48d5-a906-6eafe8d5e1c9	8c069867-7b3f-428b-8f8c-6d07ad8a0190	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
af4d85d8-ce17-40be-81fd-06a5b4254147	f2ae9986-273d-4267-8cc3-f5e4248abc07	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278879/travelcrm/gallery/yrm8jxruvmkmxjsxll4f.jpg	{}	1
9bf053b7-7702-441f-ad86-d351a87b48b4	45f65cbe-5902-4452-9406-253d74122046	accommodation	Hotel Potala		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279137/travelcrm/gallery/q6pohdpra3wqit53qq51.webp	{"category": "Luxury", "masterId": "f30630f0-93f8-4a3d-b3bf-1734e07a6514", "hotelName": "Hotel Potala", "checkInDate": "2026-04-18", "checkOutDate": "2026-04-20", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
875f4199-b72e-4a35-8f2b-90fcd86a4417	290a360e-a083-4035-841d-12079c0e3a9b	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279137/travelcrm/gallery/q6pohdpra3wqit53qq51.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "hotelOption": "Option 2", "checkOutDate": "2026-04-08", "destinationId": "699dcf21-0624-48a9-a1fe-c21db084d708"}	1
1164e2e9-6527-4e67-8531-5d1f79764969	008245fc-d439-4d51-8526-d4a669e789e9	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
a03d0921-56e1-4098-8394-7c149a19993f	008245fc-d439-4d51-8526-d4a669e789e9	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
a3826fbe-0634-4941-90ca-47598e007f59	39ced2be-5957-4fd6-a804-09c40d31a5a2	transport	Transport	WagonR	09:00	19:00	3000.00	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279436/travelcrm/itineraries/events/96e0a7f0-81a2-4d43-8a55-d6b8f391e288/car1.jpg	{"to": "Pelling", "from": "Gangtok", "vehicle": "WagonR"}	1
06669566-fd60-4364-a5f8-4aa6497f41e4	39ced2be-5957-4fd6-a804-09c40d31a5a2	accommodation	Golden Patola	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279450/travelcrm/itineraries/events/2ecdcb00-0b31-41aa-95f9-321b830a388e/HOTEL1.jpg	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "Golden Patola", "checkInDate": "2026-04-14", "checkOutDate": "2026-04-15"}	2
e1d9aa7e-caa1-42a4-8287-84f26c53a240	31f9c35c-b8be-445f-9983-0af9c2a44fb8	accommodation	PELLING HOMESTAY	BREAKFAST INCLUDED	\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279365/travelcrm/itineraries/events/b4243a8c-9e55-4db9-88a9-b062b9fdd2f9/HOTEL.webp	{"rooms": {"double": 1}, "category": "3 Star", "mealPlan": "MAP", "roomType": "DELUXE", "hotelName": "PELLING HOMESTAY", "checkInDate": "2026-04-06", "checkOutDate": "2026-04-08"}	1
b02be2e1-aa0b-4278-82f7-c44338554295	7130b0e3-b54d-4120-9f14-bcb0760c233f	transport	Transport	1 wagan r for your trip\n1 sumo/bolero for your lachen and lachung trip	06:30	19:30	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775134748/travelcrm/itineraries/events/be055021-272a-45e0-af8a-6ab89742393d/53668382_2119853148306369_4900934276058447872_n.jpg	{}	1
c0c8125c-e472-4a5b-af8f-52338f129635	7130b0e3-b54d-4120-9f14-bcb0760c233f	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775166993/travelcrm/itineraries/events/f5c765b8-e024-4a1f-80c9-0aa992564a9f/photo-1582719478250-c89cae4dc85b.avif	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
caa5b0fe-5c3a-4a15-9d3e-914fbac3de23	f2ae9986-273d-4267-8cc3-f5e4248abc07	accommodation	  Hotel Hangsha Regency or Sayaju Inn or similar 		\N	\N	\N	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775279137/travelcrm/gallery/q6pohdpra3wqit53qq51.webp	{"rooms": {"double": 2}, "category": "3 Star", "mealPlan": "map", "roomType": "DELUXE", "hotelName": "  Hotel Hangsha Regency or Sayaju Inn or similar ", "checkInDate": "2025-10-27", "checkOutDate": "2025-10-27", "checkOutTime": "12:00", "destinationId": "1a9bed23-6d7b-4bb6-9d0b-785221d4f24b"}	2
\.


--
-- TOC entry 4294 (class 0 OID 25862)
-- Dependencies: 270
-- Data for Name: itinerary_gallery_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.itinerary_gallery_images (id, itinerary_id, image_url, caption, sort_order) FROM stdin;
fbe81911-4995-401e-a847-f704b2746278	4972d723-ac4b-4f44-aa65-1070af24a9d0	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775075293/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/Discover-The-Thrilling-Adventures-Await-In-Gangtok-At-The-Lap-Of-Himalayas.avif	\N	1
9794a991-6c8d-4e78-9d57-0ccfe4ca8933	4972d723-ac4b-4f44-aa65-1070af24a9d0	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775174987/travelcrm/itineraries/4972d723-ac4b-4f44-aa65-1070af24a9d0/gallery/1000_F_290456712_DMwh185Zu3uiCXPLWPjapsoI7n9ZNlEQ.jpg	\N	2
729e976b-ab20-47a5-9754-6f2c72dbdd34	4972d723-ac4b-4f44-aa65-1070af24a9d0	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775174988/travelcrm/itineraries/4972d723-ac4b-4f44-aa65-1070af24a9d0/gallery/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg	\N	3
99f783b6-bf79-48d0-bfed-d4505983257b	4972d723-ac4b-4f44-aa65-1070af24a9d0	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775174989/travelcrm/itineraries/4972d723-ac4b-4f44-aa65-1070af24a9d0/gallery/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg	\N	4
de16e529-aa97-487a-96d9-d5a8caa5d085	4972d723-ac4b-4f44-aa65-1070af24a9d0	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775174991/travelcrm/itineraries/4972d723-ac4b-4f44-aa65-1070af24a9d0/gallery/53668382_2119853148306369_4900934276058447872_n.jpg	\N	5
7530a597-4943-47ef-9f3b-3b78fa75c887	bd43c724-60e0-4f41-a446-22cb5b15856f	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775075293/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/Discover-The-Thrilling-Adventures-Await-In-Gangtok-At-The-Lap-Of-Himalayas.avif	\N	1
f34bea26-20ac-40fa-b6a8-22f6fcbc5a0a	bd43c724-60e0-4f41-a446-22cb5b15856f	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775174987/travelcrm/itineraries/4972d723-ac4b-4f44-aa65-1070af24a9d0/gallery/1000_F_290456712_DMwh185Zu3uiCXPLWPjapsoI7n9ZNlEQ.jpg	\N	2
3ea23233-2134-4612-8458-e84bdcf84e12	bd43c724-60e0-4f41-a446-22cb5b15856f	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775174988/travelcrm/itineraries/4972d723-ac4b-4f44-aa65-1070af24a9d0/gallery/1000_F_564457445_M0k1poMZ76ThznoYAKegexisMjnQQ9SF.jpg	\N	3
877a8e18-e161-482e-b0c7-b17ce43fd146	bd43c724-60e0-4f41-a446-22cb5b15856f	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775174989/travelcrm/itineraries/4972d723-ac4b-4f44-aa65-1070af24a9d0/gallery/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg	\N	4
a26d6c8f-256a-4e06-837c-36cdf0ca42e6	bd43c724-60e0-4f41-a446-22cb5b15856f	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775174991/travelcrm/itineraries/4972d723-ac4b-4f44-aa65-1070af24a9d0/gallery/53668382_2119853148306369_4900934276058447872_n.jpg	\N	5
dbe3415b-ca7e-4032-bbb1-71160dc6a025	4972d723-ac4b-4f44-aa65-1070af24a9d0	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775174991/travelcrm/itineraries/4972d723-ac4b-4f44-aa65-1070af24a9d0/gallery/53668382_2119853148306369_4900934276058447872_n.jpg	\N	6
b0f75c67-a692-44b1-91c4-d4561345df46	92999748-1a5e-4237-814a-e431534e1aa3	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775075293/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/Discover-The-Thrilling-Adventures-Await-In-Gangtok-At-The-Lap-Of-Himalayas.avif	\N	1
fe226a81-2bc9-432d-b678-4dc3ec58b126	92999748-1a5e-4237-814a-e431534e1aa3	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775175949/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg	\N	2
82d7c92f-0326-4abc-9643-c2abfce0f4ed	89f8cd1c-c07b-4974-ada6-c5b193da8a97	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775075293/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/Discover-The-Thrilling-Adventures-Await-In-Gangtok-At-The-Lap-Of-Himalayas.avif	\N	1
2ce0171c-9df3-4c47-ad45-b35d46b82c06	89f8cd1c-c07b-4974-ada6-c5b193da8a97	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775175949/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg	\N	2
0db7dcb5-3deb-4625-8b2d-b2425aff2a86	1764f996-b3fd-4814-b01f-d090ea694ef6	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775075293/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/Discover-The-Thrilling-Adventures-Await-In-Gangtok-At-The-Lap-Of-Himalayas.avif	\N	1
732b4470-cd9a-4a5d-844a-db8ba051974d	1764f996-b3fd-4814-b01f-d090ea694ef6	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775175949/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/1000_F_1775069169_BWUF5Se2IpkBEu6ljFpZJD9sAxaDDgn0.jpg	\N	2
a85d61ba-82e1-4b41-8211-92cde4688abd	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
7697e62a-3d0c-4c9c-a9ea-477b20bd6196	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
a8c49461-cc88-44de-9710-48ea3e69a672	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
85873609-ea23-4117-8dee-9322c898406a	56bb8df4-4346-4b2c-8168-a4e4aa6255fe	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
0498c316-832f-4b27-8b7c-8b9edaa8b4d4	83ebd5c7-bb92-47d8-a976-f73286c2d5ad	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
ef057fab-ffb5-4514-a59c-45d7f10972a3	83ebd5c7-bb92-47d8-a976-f73286c2d5ad	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
c22dfa85-a812-4632-85a6-9309a5a7f0fd	83ebd5c7-bb92-47d8-a976-f73286c2d5ad	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
b7ac038c-044b-4b8a-90e3-af806f023762	83ebd5c7-bb92-47d8-a976-f73286c2d5ad	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
fe44f51d-ae90-42c4-908d-628f17cd509c	6184c7d5-776a-4f9f-a9cb-49bafc8acd15	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
224d6883-dbcd-4715-8287-2ce3fad337b4	6184c7d5-776a-4f9f-a9cb-49bafc8acd15	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
92300c35-3710-49fb-a56c-a3c8990f8c0c	6184c7d5-776a-4f9f-a9cb-49bafc8acd15	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
a49e9921-1e58-4364-9d0a-133465f520e9	6184c7d5-776a-4f9f-a9cb-49bafc8acd15	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
566c1c20-6a77-4440-9801-bf014368bab5	e4b7f9ef-f5d2-4e80-9101-fd0476768b24	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
fb4c0218-b8bd-41bf-92c1-79d0a566be6c	e4b7f9ef-f5d2-4e80-9101-fd0476768b24	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
f82a3754-bfe0-4691-934a-8149bd9b344d	e4b7f9ef-f5d2-4e80-9101-fd0476768b24	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
9eaafe41-e60c-44c9-ae5f-a732be1c8287	e4b7f9ef-f5d2-4e80-9101-fd0476768b24	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
580f7394-46e9-4729-ab48-fb6e56fe1832	972d8de3-66fe-46e6-ac53-a1fedc5632fc	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
893811a2-f2dd-4b4a-9bf5-739c8f188ad0	972d8de3-66fe-46e6-ac53-a1fedc5632fc	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
1742e336-5c1d-4d42-9313-e1322eae6dfe	972d8de3-66fe-46e6-ac53-a1fedc5632fc	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
803ab0fa-ef84-4a76-a242-a4cb3b6a6cf8	972d8de3-66fe-46e6-ac53-a1fedc5632fc	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
a6a02963-68ac-42ea-a2e8-48b77a38835a	615a7192-2158-4907-8f2b-69ce38fd2c9d	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
3a718143-8a20-4861-ba96-b7748bdf6f45	615a7192-2158-4907-8f2b-69ce38fd2c9d	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
561649df-11eb-4126-bf3c-6e20d25e4cf8	615a7192-2158-4907-8f2b-69ce38fd2c9d	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
0ee5fc11-5a38-4abd-8624-e28c1634d21d	615a7192-2158-4907-8f2b-69ce38fd2c9d	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
afec24f2-669a-40bd-b649-e31d3f621eae	0fe6eea6-3c10-4d1f-ab2a-dc015703a28b	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
c70d2ae2-8203-4c73-b175-ec76a032d217	0fe6eea6-3c10-4d1f-ab2a-dc015703a28b	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
3f873cb2-f427-49f8-ac09-d828d764f078	0fe6eea6-3c10-4d1f-ab2a-dc015703a28b	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
d52a4264-0c2a-4b0c-b04b-84b5f9c0f75f	0fe6eea6-3c10-4d1f-ab2a-dc015703a28b	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
8538c2bd-3b54-482c-be3d-ecec6e285242	8c37b487-44b0-418c-a8c1-04cd9567e39b	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
2bd6b985-4d17-40b8-a680-9e87da6eca75	8c37b487-44b0-418c-a8c1-04cd9567e39b	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
bdf4164e-c275-41f7-951a-4bbe62960e94	8c37b487-44b0-418c-a8c1-04cd9567e39b	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
b4127ea2-80cf-4ef1-a43b-9f8c330a63c8	8c37b487-44b0-418c-a8c1-04cd9567e39b	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
478aaaea-a2af-4370-b002-021c5a50b560	f5d551b1-647c-476c-95f9-5036db31e6fa	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
35380477-08b3-4bda-9d29-2a440c92f6c2	f5d551b1-647c-476c-95f9-5036db31e6fa	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
8401d3e9-d7ef-44b3-b375-cad15f01e40c	f5d551b1-647c-476c-95f9-5036db31e6fa	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
4bc76de7-e43c-43c0-8fec-a68170f1e82b	f5d551b1-647c-476c-95f9-5036db31e6fa	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
afbad6ca-1c25-4744-af4d-768fc68153c9	27b10c1d-5542-4c8b-8311-6dcb4a76e026	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
20848226-3daf-4f9d-8d74-bca84644139a	27b10c1d-5542-4c8b-8311-6dcb4a76e026	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
5cd095a1-4d24-4959-8b75-90d4c2205abe	27b10c1d-5542-4c8b-8311-6dcb4a76e026	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
19f38d7f-5c3a-4b44-aecb-810ba8b245cc	27b10c1d-5542-4c8b-8311-6dcb4a76e026	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
6e580d6a-5004-4f8e-8036-80988fa067c7	9e09df64-62d1-4bd9-a90b-cb52eb9a2dd0	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
25183621-e47d-43df-bb0e-cf3097aae6c0	9e09df64-62d1-4bd9-a90b-cb52eb9a2dd0	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
20d95101-7e1f-425f-b946-7c8f17fc4537	9e09df64-62d1-4bd9-a90b-cb52eb9a2dd0	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
5ad59047-b2a6-4183-adbc-984aad04213a	9e09df64-62d1-4bd9-a90b-cb52eb9a2dd0	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
d5915f91-0898-41f2-8617-f45471aa3097	2bf89103-3d87-4629-8062-3be48123177c	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
666fb0d1-2b89-4fff-b25f-66c4f13ace99	2bf89103-3d87-4629-8062-3be48123177c	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
ff96ba84-6f82-4f84-9821-ee1300094c04	2bf89103-3d87-4629-8062-3be48123177c	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
2e3612c4-7a24-4b43-a94f-047a5ae3ad16	2bf89103-3d87-4629-8062-3be48123177c	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
da3826d0-4317-4824-a4ab-ea11924cb1ce	3bbc19c9-257e-490f-b266-2e36d112e9f9	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
f4eef877-3d61-405d-b53d-90e9a654c7c1	3bbc19c9-257e-490f-b266-2e36d112e9f9	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
cdb9fa16-14f0-4729-a1bb-a9337f3e38b3	3bbc19c9-257e-490f-b266-2e36d112e9f9	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
de832e1b-a3ff-4b7c-8207-9efd093c5ca4	3bbc19c9-257e-490f-b266-2e36d112e9f9	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
aec11678-54d1-4014-949a-e74a15f98497	6cceb0e3-ab28-4ec1-9329-0a5de95c630c	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
876de55a-9b63-432d-b3e7-beef6b7d6bf7	6cceb0e3-ab28-4ec1-9329-0a5de95c630c	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
8a6795e4-4222-4f2e-8ddd-8287cff825b9	6cceb0e3-ab28-4ec1-9329-0a5de95c630c	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
766507cd-9254-4dae-b775-c40c0f6a23d5	6cceb0e3-ab28-4ec1-9329-0a5de95c630c	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
48cf6e2a-c95b-465e-890b-de0c48c37736	ca7cf7bc-765d-4fea-8963-d5c0b5273f1a	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
3913cdc6-cb46-467d-bdbe-4cde25507d8c	ca7cf7bc-765d-4fea-8963-d5c0b5273f1a	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
d70af7d2-1bf8-4f1f-aadd-4611129e0b7d	ca7cf7bc-765d-4fea-8963-d5c0b5273f1a	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
846f5757-f678-43d8-9749-852614824822	ca7cf7bc-765d-4fea-8963-d5c0b5273f1a	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
afe22130-8a2a-4c99-b61f-66f88e226568	f5d551b1-647c-476c-95f9-5036db31e6fa	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456672/travelcrm/itineraries/f5d551b1-647c-476c-95f9-5036db31e6fa/gallery/zuluk.webp	\N	5
2a8ec047-f076-4f15-b19e-e72117b885b4	6e7f2e3c-39d4-4d96-a3af-fcad95f5f73e	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
27761e2d-8558-415a-bb7f-f02be213fc6b	6e7f2e3c-39d4-4d96-a3af-fcad95f5f73e	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
68b75fe1-bedf-4f7b-931b-a8041ef38a3d	6e7f2e3c-39d4-4d96-a3af-fcad95f5f73e	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
1a95bf51-064b-4095-8cda-599a297fb4e0	6e7f2e3c-39d4-4d96-a3af-fcad95f5f73e	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
58a67151-1f7a-4651-8f06-b8c16e828b7c	6e7f2e3c-39d4-4d96-a3af-fcad95f5f73e	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456672/travelcrm/itineraries/f5d551b1-647c-476c-95f9-5036db31e6fa/gallery/zuluk.webp	\N	5
5c1aa712-a726-4237-a90b-7bee4331a8b0	5a5011e0-e186-46a2-822f-96a2f41cea17	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
49df14c9-bfdc-41ea-8ad9-1536e6243465	5a5011e0-e186-46a2-822f-96a2f41cea17	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
6092e6d7-ccb2-473c-b518-de1adb01dac3	5a5011e0-e186-46a2-822f-96a2f41cea17	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
d3448984-3bf4-4d57-bb33-424bf4f19429	5a5011e0-e186-46a2-822f-96a2f41cea17	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
0b4edbe8-db10-42d4-95c1-2799c7557b18	5a5011e0-e186-46a2-822f-96a2f41cea17	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456672/travelcrm/itineraries/f5d551b1-647c-476c-95f9-5036db31e6fa/gallery/zuluk.webp	\N	5
b9955aa3-f72b-4e25-8eae-0dd68e933b5a	8b17a394-37e4-4354-b4a4-48baa5d4a1e7	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
5d46a7c4-9ab4-4a4c-a8d2-501481168c21	8b17a394-37e4-4354-b4a4-48baa5d4a1e7	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
cd929547-38cc-4ad4-96c2-afdf0d57ad36	8b17a394-37e4-4354-b4a4-48baa5d4a1e7	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
391b2a89-9033-4f6a-8626-62090c6b4386	8b17a394-37e4-4354-b4a4-48baa5d4a1e7	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
1f932f71-6c65-4f2a-85be-506c871ffd5d	8b17a394-37e4-4354-b4a4-48baa5d4a1e7	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775456672/travelcrm/itineraries/f5d551b1-647c-476c-95f9-5036db31e6fa/gallery/zuluk.webp	\N	5
2be9b7f5-330c-41dd-9cef-bf93e546f62e	83f4406f-5799-4252-a7b7-8718a9e49530	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
9fff0a43-3e4f-4af0-a55d-a31c101eb302	83f4406f-5799-4252-a7b7-8718a9e49530	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
db82de0c-2cb0-4460-bd96-9bfea7ebceb0	83f4406f-5799-4252-a7b7-8718a9e49530	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
f0212c80-a7ca-46b2-8d12-8e0fa005c149	83f4406f-5799-4252-a7b7-8718a9e49530	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
3b34c240-a8d3-447c-aa95-0fbc506db671	bb600f5c-f403-4356-9f85-4b3c02bb5523	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
8328fcf7-70da-4c56-ba06-2a4c43a176cf	bb600f5c-f403-4356-9f85-4b3c02bb5523	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
6fe8cc05-a1a0-4f77-806e-13e9eb858ab2	bb600f5c-f403-4356-9f85-4b3c02bb5523	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
299ec82e-ded2-4dd4-a766-c1b76cbcc507	bb600f5c-f403-4356-9f85-4b3c02bb5523	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
cccb700e-7884-4485-a913-1b6df61d9d38	f21339a4-bf54-44b7-acc2-06d29fed6f9d	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
42776a7a-8057-4b47-87ea-0e6e015d7bf3	f21339a4-bf54-44b7-acc2-06d29fed6f9d	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
5ccdbc0b-bba3-4aca-83f5-a44d63d4e5e2	f21339a4-bf54-44b7-acc2-06d29fed6f9d	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
8b6ee99b-14de-4ef6-aeb3-56d349abeab9	f21339a4-bf54-44b7-acc2-06d29fed6f9d	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
b8ccbbda-6bac-4b1e-8a79-dd9b2a4e747a	0dc216b0-2e16-496d-ac8c-3650bef26fc5	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
8deee689-e274-468f-a74d-83186d86116f	0dc216b0-2e16-496d-ac8c-3650bef26fc5	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
223f5e7a-a5a8-40aa-9f86-38261861f7c9	0dc216b0-2e16-496d-ac8c-3650bef26fc5	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
26e48a78-840a-4a28-a613-c31e54f123ef	0dc216b0-2e16-496d-ac8c-3650bef26fc5	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
301314f6-f886-4156-8258-82c39c0196ab	19a94c0f-bb35-46bb-9625-756af72ca8e5	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
109b5904-3937-4b03-aa72-db38e18f2647	19a94c0f-bb35-46bb-9625-756af72ca8e5	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
f9971a5e-f361-4eb5-b53c-6adb222cd4aa	19a94c0f-bb35-46bb-9625-756af72ca8e5	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
cad35923-6398-4af8-a1a6-cf4422bf87bd	19a94c0f-bb35-46bb-9625-756af72ca8e5	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
817ed169-a920-44ec-a300-c05264c2764b	0ad965a6-cdb0-4dbb-b594-4ac2070cbe58	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
8920d92d-989a-4afe-bc8d-bfde30408047	0ad965a6-cdb0-4dbb-b594-4ac2070cbe58	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
337937e7-113f-401f-9bd1-b709b5641cc0	0ad965a6-cdb0-4dbb-b594-4ac2070cbe58	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
d059623a-db4f-4a35-975c-5b4cffe7390d	0ad965a6-cdb0-4dbb-b594-4ac2070cbe58	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
ed1d5577-bf31-4c53-be95-0a32f63f5c7a	f8cdf0c6-8f94-4844-8dd7-82952db885f7	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
a8914d21-a8a2-43f4-9294-12882a0ebe5e	f8cdf0c6-8f94-4844-8dd7-82952db885f7	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
c00f6d93-ed6e-408c-be15-a62c5d199cbe	f8cdf0c6-8f94-4844-8dd7-82952db885f7	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
091fbbaf-5b2d-4892-8432-e70c77d156f3	f8cdf0c6-8f94-4844-8dd7-82952db885f7	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
85317518-5392-47eb-9387-9762e3a1d8a5	e210a64a-d41a-4dec-be58-0424db603e98	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
77c46e06-1c64-4bac-931a-2548aae37bc0	e210a64a-d41a-4dec-be58-0424db603e98	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
31aac1da-f8b6-449e-80f4-883289b7a73b	e210a64a-d41a-4dec-be58-0424db603e98	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
1301df94-02b0-4194-b163-07f7111b749d	e210a64a-d41a-4dec-be58-0424db603e98	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
88162447-4c95-4d53-800d-41379453da6b	83f4406f-5799-4252-a7b7-8718a9e49530	https://res.cloudinary.com/duxmcwrh3/image/upload/v1776062652/travelcrm/itineraries/83f4406f-5799-4252-a7b7-8718a9e49530/gallery/avinash-kumar-vDempbPR52w-unsplash.jpg	\N	5
9d11812d-5fd2-4174-9297-8a14591b407a	83f4406f-5799-4252-a7b7-8718a9e49530	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775751601/travelcrm/gallery/tm5vtag0blw4pbdxrypc.jpg	\N	6
36454225-d088-473e-aafd-46353f034b37	e17bcc9c-a96b-4ff0-a403-393c07ea7d8d	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
9e936c33-7a41-4056-91aa-8cebe5146997	e17bcc9c-a96b-4ff0-a403-393c07ea7d8d	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
f7c6d831-4483-4c3a-a20c-7c53aa377dba	e17bcc9c-a96b-4ff0-a403-393c07ea7d8d	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
3faf078c-eb7a-40a7-8f86-8cde10857fe3	e17bcc9c-a96b-4ff0-a403-393c07ea7d8d	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
235e64c7-6d60-4842-a829-a512f4d163fe	e54911c0-eaeb-4eea-beeb-41f89dd7e434	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
f4067b83-926f-4175-a862-ba06bdafa63e	e54911c0-eaeb-4eea-beeb-41f89dd7e434	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
e803b2ed-cbfd-4c8a-87f2-792ab7218997	e54911c0-eaeb-4eea-beeb-41f89dd7e434	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
993f296e-835f-4342-a85c-66e08ab7f33e	e54911c0-eaeb-4eea-beeb-41f89dd7e434	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
dbe78761-6164-45b5-b9f8-cf45e9b6fc31	21deb578-3d51-428c-bb96-b0705a0ee168	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277179/travelcrm/gallery/wxn175xvtdanhfmozmal.jpg	\N	1
28ec3652-8418-40bc-96fd-ae84db23dbaa	21deb578-3d51-428c-bb96-b0705a0ee168	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277451/travelcrm/gallery/dcsrent6d7vuq8axkws4.jpg	\N	2
15fdaa7c-111f-41b9-b80c-dd96251ac997	21deb578-3d51-428c-bb96-b0705a0ee168	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775278364/travelcrm/gallery/bnvofv4na83vpanpgjhi.jpg	\N	3
63d82296-9be5-453a-9bb5-9477de502bf8	21deb578-3d51-428c-bb96-b0705a0ee168	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775277918/travelcrm/gallery/ezgauresxmvwlv1beebt.jpg	\N	4
658db55b-eeda-42e2-8af3-9c3c423ea11f	21deb578-3d51-428c-bb96-b0705a0ee168	https://res.cloudinary.com/duxmcwrh3/image/upload/v1776062652/travelcrm/itineraries/83f4406f-5799-4252-a7b7-8718a9e49530/gallery/avinash-kumar-vDempbPR52w-unsplash.jpg	\N	5
93fd4114-a83a-4533-a3aa-7f2f86ac8db5	21deb578-3d51-428c-bb96-b0705a0ee168	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775751601/travelcrm/gallery/tm5vtag0blw4pbdxrypc.jpg	\N	6
bc43bd2e-fcb4-4d37-ad3a-d74ae3d73083	20c3aa9b-b85b-4be5-970f-21fc668f569b	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177318/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-bliss-30156563.jpg	\N	6
a2b95920-337e-494c-ac84-725db73f329b	20c3aa9b-b85b-4be5-970f-21fc668f569b	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177319/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/pexels-nans1419-19430986.jpg	\N	7
36fd8256-a3c6-42ca-a7a5-34e2ab9febff	20c3aa9b-b85b-4be5-970f-21fc668f569b	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177321/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1506059612708-99d6c258160e.avif	\N	8
d39f4ac7-9c78-4645-a07d-1259df961db7	20c3aa9b-b85b-4be5-970f-21fc668f569b	https://res.cloudinary.com/duxmcwrh3/image/upload/v1775177322/travelcrm/itineraries/56bb8df4-4346-4b2c-8168-a4e4aa6255fe/gallery/photo-1582719478250-c89cae4dc85b.avif	\N	9
\.


--
-- TOC entry 4272 (class 0 OID 16983)
-- Dependencies: 248
-- Data for Name: meal_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meal_plans (id, name, price, is_active, deleted_at) FROM stdin;
53b6f44c-f88f-4137-b276-3192d3d198d8	AFTERNOON - Gantok	300.00	t	2026-04-01 20:37:04.652
29014b75-44aa-4a78-8690-f18f94421697	BB -Gangtok	200.00	t	2026-04-01 20:37:07.219
7dfb265d-63ce-47c5-98dd-3cdaad739518	Complete day - Gangtok	1000.00	t	2026-04-01 20:37:09.203
87836fe7-3494-48da-880b-882ca27b7144	Evening- Gangtok	100.00	t	2026-04-01 20:37:11.247
4baab9b7-436f-4b85-8529-619c24ac2b22	Night - Gangtok	250.00	t	2026-04-01 20:37:13.43
\.


--
-- TOC entry 4260 (class 0 OID 16626)
-- Dependencies: 236
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, message, channel, priority, related_type, related_id, is_read, sent_at, created_at) FROM stdin;
cd8d5741-14ee-4767-8b29-b05ccdc92697	78e1048f-3584-4f57-a821-306e2fda5816	followup_due	Follow-up is overdue for Lead c3e98583-a729-4f2a-985f-53f0588966ce.	in_app	high	query	c3e98583-a729-4f2a-985f-53f0588966ce	f	\N	2026-03-28 03:30:00.533
\.


--
-- TOC entry 4267 (class 0 OID 16923)
-- Dependencies: 243
-- Data for Name: org_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.org_settings (id, key, value, description, updated_at) FROM stdin;
09fe2efb-d8cf-4a24-b0bd-b109704cf54a	emailSignature	<p><strong>Imagica Holidays</strong> 🏨 </p><p>📞 <strong>Bookings:</strong> [Phone Number] ☎️</p><p>💳 <strong>Finance:</strong> [Phone Number] 💳</p><p>✉️ <strong>Mail: </strong>info@imagicaholidays.com📩</p><p>🌐 <strong>Web:</strong> <a href="http://imagicaholidays.com" rel="noopener noreferrer" target="_blank">imagicaholidays.com</a> 🌐</p>	\N	2026-05-30 12:58:57.952
6506c8a4-312f-4546-afc7-b9e381a41fed	companyName	Imagica Holidays 	\N	2026-05-30 12:58:57.952
a6184573-6878-415b-a52f-458ee3cbcc3a	companyEmail	info.imagicaholidays@gmail.com	\N	2026-05-30 12:58:57.952
5aa1d05b-e5b5-409a-9ffd-f44291db0b86	companyPhone	+91 89107 59374	\N	2026-05-30 12:58:57.952
2b63aebc-11e8-4e02-bea7-b46246ab6cb7	companyAddress	Address: 46, B.T. Road, Khardah, Kolkata – 700117	\N	2026-05-30 12:58:57.952
\.


--
-- TOC entry 4282 (class 0 OID 17160)
-- Dependencies: 258
-- Data for Name: package_terms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.package_terms (id, name, body_html, is_default, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4273 (class 0 OID 16996)
-- Dependencies: 249
-- Data for Name: package_themes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.package_themes (id, name, is_active, deleted_at, icon_url) FROM stdin;
\.


--
-- TOC entry 4259 (class 0 OID 16609)
-- Dependencies: 235
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, tour_id, query_id, amount, mode, reference_utr, payment_date, recorded_by, status, notes, idempotency_key, deleted_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4246 (class 0 OID 16417)
-- Dependencies: 222
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, key, label, module, description) FROM stdin;
4d14ead8-c99c-4063-900c-4abc082f3603	users.view	View Users	users	\N
86b8228b-1a95-4314-9fa2-e0516c410739	users.manage	Manage Users	users	\N
5c480757-9614-4961-9bc0-d82dbdd4a739	query.view_all	View all queries	queries	\N
568495ef-43c8-46be-90e7-62e49a7e55e5	query.view_assigned	View assigned queries	queries	\N
34336283-1138-47e1-a62c-20de8a097513	query.create	Create query	queries	\N
0a3a9249-8f16-4541-9130-ffa06344561c	query.edit_all	Edit all queries	queries	\N
d828db7e-7740-496f-a9ef-37e7d0fcdbdf	query.edit_own	Edit own queries	queries	\N
50106eaa-8fbb-45f2-bff7-169582d94602	query.delete	Delete queries	queries	\N
841bea08-516e-40c2-b29a-72d3893f217b	query.assign	Assign queries	queries	\N
d0e48f82-daf6-4f4f-b7ff-5540baa4b1b3	query.status_change	Change query status	queries	\N
ab723f93-9662-4873-a8e7-afbee6009cea	proposal.view_all	View all proposals	proposals	\N
4a85455e-01d3-4d24-b513-f8da08a6a034	proposal.view_assigned	View assigned proposals	proposals	\N
1d48b5c6-5976-4bc9-91cc-28d8507f8f4d	proposal.create	Create proposal	proposals	\N
e1203a09-bd01-4032-ae96-267127584b68	proposal.edit_all	Edit all proposals	proposals	\N
6f25efdb-a1c2-40bd-9a71-9ac1bd20495c	proposal.edit_own	Edit own proposals	proposals	\N
48f20653-37d3-4eec-bc6b-6ba5c5b14586	proposal.delete	Delete proposals	proposals	\N
e41dc645-5978-4d2c-9758-fa28960b8572	proposal.send	Send proposals	proposals	\N
4222e45b-74ee-41f3-88b7-bdbc5907a4b9	tour.view_all	View all tours	tours	\N
4482e1eb-1e58-448e-b1c0-1cb65aa7a7a5	tour.view_assigned	View assigned tours	tours	\N
afea8f06-32d8-40bf-b903-cc51b2457b57	tour.create	Create tour	tours	\N
1ad83951-8eaf-49ed-9c36-85ac5a94d1c1	tour.edit_all	Edit all tours	tours	\N
ef5657c6-7628-4e9f-b915-bcaf868ef21d	tour.edit_own	Edit own tours	tours	\N
7ea3f969-ddff-426c-991a-b89fb9e65a1d	tour.delete	Delete tours	tours	\N
e5eed579-aa34-4a6b-9ae9-e8acb8f139ee	tour.status_change	Change tour status	tours	\N
9724f098-c399-4068-9f9f-89aff0b3df71	payment.view_all	View all payments	payments	\N
99e0b0f7-00c5-42f4-b033-aa53caac0599	payment.view_assigned	View assigned payments	payments	\N
6074b7e0-8775-4a07-befa-75c88b59a09d	payment.create	Create payment	payments	\N
561f8aae-13ab-4d63-863a-b9886bb12b91	payment.edit_all	Edit all payments	payments	\N
63701aa8-785a-44a2-8958-1ecf3c34d6bf	payment.edit_own	Edit own payments	payments	\N
8aa6ba4a-91ea-4fb2-a46f-bbc673f023dd	payment.delete	Delete payments	payments	\N
16f8ac93-4a15-4633-9b21-8d314fa23b32	payment.verify	Verify payments	payments	\N
6f0b5f08-6c4c-4306-8ad8-061c7d79c083	payment.bank	Bank payments	payments	\N
f91ac424-7862-4d9e-ab23-7129cc811346	report.view_sales	View sales reports	reports	\N
4acadd27-bafc-47e2-a94c-0d5c8ae7c9b3	report.view_finance	View finance reports	reports	\N
2aff6719-d541-4b90-911b-609cfb5b87b8	report.view_ops	View ops reports	reports	\N
9d73ce50-fc68-42cb-a6d8-3c9a3608f958	report.export	Export reports	reports	\N
ab3ba0d1-c8a9-4c0f-8714-213d1c3cb4b7	master.view	View masters	masters	\N
a78d73f4-2787-4992-87cb-44e5eb2cb508	master.manage_destinations	Manage destinations	masters	\N
23e5f7b2-76b3-44be-9bb0-5e3aadd0ffd4	master.manage_hotels	Manage hotels	masters	\N
ce464231-954c-4325-ada4-972b2370504e	master.manage_vendors	Manage vendors	masters	\N
e483d7cf-2fce-4071-9e58-3fdbea7fa444	master.manage_settings	Manage settings	masters	\N
f213ee43-8de0-49fc-821e-249e72c03b6d	cancellation.view_all	View all cancellations	cancellations	\N
3a7183b9-d3b4-46df-a5d0-ffb284466d90	cancellation.view_assigned	View assigned cancellations	cancellations	\N
06c1dd3b-457c-4f51-97ba-35f98e2fb835	cancellation.create	Create cancellation	cancellations	\N
b68bab70-3141-47ed-9b43-b77abeff81d3	cancellation.process	Process cancellation	cancellations	\N
389f5163-ef67-4c88-a514-d8b954d713dc	integration.view_logs	View integration logs	integrations	\N
f5bfd28c-d9d4-42a5-bc51-d16f6144da67	integration.manage_settings	Manage integration settings	integrations	\N
16aa5be4-268d-41c5-9f0e-7c1a969a6dd8	activity.view_logs	View activity logs	activity	\N
\.


--
-- TOC entry 4256 (class 0 OID 16566)
-- Dependencies: 232
-- Data for Name: proposal_days; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_days (id, proposal_id, day_number, destination_id, hotel_id, activities, meals_included, transport, day_cost, description) FROM stdin;
\.


--
-- TOC entry 4255 (class 0 OID 16549)
-- Dependencies: 231
-- Data for Name: proposals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposals (id, query_id, version, total_cost, markup_pct, selling_price, pdf_url, pdf_status, sent_at, last_sent_at, created_by, deleted_at, created_at, updated_at, itinerary_id, status, travel_date_from, travel_date_to) FROM stdin;
\.


--
-- TOC entry 4251 (class 0 OID 16490)
-- Dependencies: 227
-- Data for Name: queries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.queries (id, query_code, version, name, phone, email, destination, travel_date_from, travel_date_to, adults, children, budget, lead_source, campaign_name, status, assigned_to, next_followup_at, merged_into, deleted_at, created_at, updated_at, b2b_agent_id, client_id) FROM stdin;
\.


--
-- TOC entry 4290 (class 0 OID 17350)
-- Dependencies: 266
-- Data for Name: query_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.query_documents (id, query_id, file_name, file_url, file_type, file_size, uploaded_by, label, created_at) FROM stdin;
\.


--
-- TOC entry 4252 (class 0 OID 16513)
-- Dependencies: 228
-- Data for Name: query_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.query_notes (id, query_id, user_id, note, follow_up_at, deleted_at, created_at, note_type) FROM stdin;
\.


--
-- TOC entry 4266 (class 0 OID 16901)
-- Dependencies: 242
-- Data for Name: query_status_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.query_status_settings (id, code, label, color_hex, is_dashboard_visible, is_locked, take_note_flag, sequence, is_active) FROM stdin;
d8d4c78e-f3dc-42d2-9ca8-be7ee240f7b9	in_progress	In Progress	#06b6d4	t	t	t	50	t
de691367-a04f-43f7-837d-a1e3691de349	new	New	#000000	t	f	f	10	t
4d65421c-82b8-4823-b786-2d4dfa3d62de	quoted	Quoted	#d8be13	t	f	f	20	t
2a2103bc-bf4d-4aa1-ad99-4bdac4d32b84	negotiation	Negotiation	#0a12f5	t	f	f	30	t
5dac6b54-d69f-4db5-b774-bd266f2c1173	confirmed	Confirmed	#d50b0b	t	t	t	40	t
eefa9d84-df9f-463b-ae0d-6402efab4f09	completed	Completed	#0c0d0d	f	t	f	60	t
c74f9fa9-9a51-4d80-b009-033b67061395	lost	Lost	#5ff042	f	t	t	70	t
dffc4fdd-ad22-4fd2-88ae-83fa40038a69	invalid	Invalid	#0d8ece	f	t	f	80	t
\.


--
-- TOC entry 4247 (class 0 OID 16428)
-- Dependencies: 223
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, role_id, permission_id, granted) FROM stdin;
e37ad131-e117-4680-9e05-9bea5588acb4	62ec749d-ba99-46ed-acdc-1a5292c9039e	4d14ead8-c99c-4063-900c-4abc082f3603	t
c97580d2-1c27-4aec-9172-699a5279d789	62ec749d-ba99-46ed-acdc-1a5292c9039e	86b8228b-1a95-4314-9fa2-e0516c410739	t
b1a61149-fa29-40cf-a006-9ed2ca235113	62ec749d-ba99-46ed-acdc-1a5292c9039e	5c480757-9614-4961-9bc0-d82dbdd4a739	t
7536f7e8-0879-44c0-b71f-4a712f6adc31	62ec749d-ba99-46ed-acdc-1a5292c9039e	568495ef-43c8-46be-90e7-62e49a7e55e5	t
634ab9b7-2c5e-45f2-bbae-a277bbdd08db	62ec749d-ba99-46ed-acdc-1a5292c9039e	34336283-1138-47e1-a62c-20de8a097513	t
74584880-48d4-4da0-bb57-ceb83adbc90e	62ec749d-ba99-46ed-acdc-1a5292c9039e	0a3a9249-8f16-4541-9130-ffa06344561c	t
ba0e431f-ffdb-4ad2-8ef6-b01863c46009	62ec749d-ba99-46ed-acdc-1a5292c9039e	d828db7e-7740-496f-a9ef-37e7d0fcdbdf	t
665779ba-133b-491d-8561-06448e8ecf4b	62ec749d-ba99-46ed-acdc-1a5292c9039e	50106eaa-8fbb-45f2-bff7-169582d94602	t
72544f64-f74f-49ba-8e06-1153625e3c7b	62ec749d-ba99-46ed-acdc-1a5292c9039e	841bea08-516e-40c2-b29a-72d3893f217b	t
bceb577a-c0a1-42cd-b76b-d3990054fe60	62ec749d-ba99-46ed-acdc-1a5292c9039e	d0e48f82-daf6-4f4f-b7ff-5540baa4b1b3	t
8d0e0477-7347-4983-9560-30e27861e2f0	62ec749d-ba99-46ed-acdc-1a5292c9039e	ab723f93-9662-4873-a8e7-afbee6009cea	t
bbbde70c-10cd-42ab-bb4a-7fb3b13fb029	62ec749d-ba99-46ed-acdc-1a5292c9039e	4a85455e-01d3-4d24-b513-f8da08a6a034	t
15dd14c9-8a69-4b0b-a16b-e01bdd87398f	62ec749d-ba99-46ed-acdc-1a5292c9039e	1d48b5c6-5976-4bc9-91cc-28d8507f8f4d	t
99de1c5b-f058-406b-9eb0-319acb24963a	62ec749d-ba99-46ed-acdc-1a5292c9039e	e1203a09-bd01-4032-ae96-267127584b68	t
d39c4109-ef8e-4f60-8370-4fdd173c6b0d	62ec749d-ba99-46ed-acdc-1a5292c9039e	6f25efdb-a1c2-40bd-9a71-9ac1bd20495c	t
3380fe0c-146b-4906-bdc6-de3dcf16d9d5	62ec749d-ba99-46ed-acdc-1a5292c9039e	48f20653-37d3-4eec-bc6b-6ba5c5b14586	t
2d07fd3e-78af-44c2-95f8-9f155468ae57	62ec749d-ba99-46ed-acdc-1a5292c9039e	e41dc645-5978-4d2c-9758-fa28960b8572	t
9c0d55e8-3ae9-4170-99fa-7d6a26e97742	62ec749d-ba99-46ed-acdc-1a5292c9039e	4222e45b-74ee-41f3-88b7-bdbc5907a4b9	t
3715b085-32a7-4174-b6af-caf0f66ef43b	62ec749d-ba99-46ed-acdc-1a5292c9039e	4482e1eb-1e58-448e-b1c0-1cb65aa7a7a5	t
90992358-1a05-413a-a60a-fdfe84ac5658	62ec749d-ba99-46ed-acdc-1a5292c9039e	afea8f06-32d8-40bf-b903-cc51b2457b57	t
9ba344e1-41b5-40ff-9f35-876121667be2	62ec749d-ba99-46ed-acdc-1a5292c9039e	1ad83951-8eaf-49ed-9c36-85ac5a94d1c1	t
f0695b0e-bfe2-48bf-9f6e-18044e9d238e	62ec749d-ba99-46ed-acdc-1a5292c9039e	ef5657c6-7628-4e9f-b915-bcaf868ef21d	t
37f275c3-2857-4b5e-8196-7932431bcdfc	62ec749d-ba99-46ed-acdc-1a5292c9039e	7ea3f969-ddff-426c-991a-b89fb9e65a1d	t
43ea4040-bba8-4687-9ea5-cc8e9cc7aba3	62ec749d-ba99-46ed-acdc-1a5292c9039e	e5eed579-aa34-4a6b-9ae9-e8acb8f139ee	t
c9f60141-2e1d-48cd-a70c-01934f3ef6b9	62ec749d-ba99-46ed-acdc-1a5292c9039e	9724f098-c399-4068-9f9f-89aff0b3df71	t
6d249da2-4276-435e-88ab-eced15682e12	62ec749d-ba99-46ed-acdc-1a5292c9039e	99e0b0f7-00c5-42f4-b033-aa53caac0599	t
a73f55ed-59fa-484a-a075-db90614954c9	62ec749d-ba99-46ed-acdc-1a5292c9039e	6074b7e0-8775-4a07-befa-75c88b59a09d	t
03276452-2b78-4cdb-9f72-00b700217835	62ec749d-ba99-46ed-acdc-1a5292c9039e	561f8aae-13ab-4d63-863a-b9886bb12b91	t
dc9b9593-68c0-4ebd-9f22-64f6b548e0d0	62ec749d-ba99-46ed-acdc-1a5292c9039e	63701aa8-785a-44a2-8958-1ecf3c34d6bf	t
e9f639a2-4472-498f-872e-70bffc1bfd4b	62ec749d-ba99-46ed-acdc-1a5292c9039e	8aa6ba4a-91ea-4fb2-a46f-bbc673f023dd	t
f649b997-36ee-424e-921e-195b6c7ba6a1	62ec749d-ba99-46ed-acdc-1a5292c9039e	16f8ac93-4a15-4633-9b21-8d314fa23b32	t
3401a287-0517-41b5-bb1e-f58b4e5c1493	62ec749d-ba99-46ed-acdc-1a5292c9039e	6f0b5f08-6c4c-4306-8ad8-061c7d79c083	t
f709d3cb-b0fa-4e33-b1f7-7d9411bcfe3b	62ec749d-ba99-46ed-acdc-1a5292c9039e	f91ac424-7862-4d9e-ab23-7129cc811346	t
d8f48107-a3a8-44dc-acaf-be1f1c031ee6	62ec749d-ba99-46ed-acdc-1a5292c9039e	4acadd27-bafc-47e2-a94c-0d5c8ae7c9b3	t
aae7336c-7daa-48e4-b3ac-4d39e1142f32	62ec749d-ba99-46ed-acdc-1a5292c9039e	2aff6719-d541-4b90-911b-609cfb5b87b8	t
d744cd2c-c4bb-45ee-9740-f547a7e70b24	62ec749d-ba99-46ed-acdc-1a5292c9039e	9d73ce50-fc68-42cb-a6d8-3c9a3608f958	t
4fed9a98-8fac-4ec5-a59e-9099d5a41b9f	62ec749d-ba99-46ed-acdc-1a5292c9039e	ab3ba0d1-c8a9-4c0f-8714-213d1c3cb4b7	t
8116fabc-3f4f-4a9d-83af-6cc1a0bd1ba7	62ec749d-ba99-46ed-acdc-1a5292c9039e	a78d73f4-2787-4992-87cb-44e5eb2cb508	t
e6891c4f-329e-4c0b-ae21-2ad8eee5cd46	62ec749d-ba99-46ed-acdc-1a5292c9039e	23e5f7b2-76b3-44be-9bb0-5e3aadd0ffd4	t
7db6c746-6cfe-42d0-a65e-bc61a664135d	62ec749d-ba99-46ed-acdc-1a5292c9039e	ce464231-954c-4325-ada4-972b2370504e	t
37c2c415-df37-4486-94ae-07b0803943c4	62ec749d-ba99-46ed-acdc-1a5292c9039e	e483d7cf-2fce-4071-9e58-3fdbea7fa444	t
81c5ca24-5edc-449e-8b45-966d61421767	62ec749d-ba99-46ed-acdc-1a5292c9039e	f213ee43-8de0-49fc-821e-249e72c03b6d	t
01bf1517-16bf-4a03-9cc8-4faae3a2ed04	62ec749d-ba99-46ed-acdc-1a5292c9039e	3a7183b9-d3b4-46df-a5d0-ffb284466d90	t
9af699a1-3cd8-4f08-af97-5247b96d9ffe	62ec749d-ba99-46ed-acdc-1a5292c9039e	06c1dd3b-457c-4f51-97ba-35f98e2fb835	t
20bc18b6-38d9-4df0-8202-6d47892c8ef5	62ec749d-ba99-46ed-acdc-1a5292c9039e	b68bab70-3141-47ed-9b43-b77abeff81d3	t
7d97872d-cac2-417c-bacc-645b67c45ea7	62ec749d-ba99-46ed-acdc-1a5292c9039e	389f5163-ef67-4c88-a514-d8b954d713dc	t
2ee9045c-c881-4a6e-8eb4-38995c023530	62ec749d-ba99-46ed-acdc-1a5292c9039e	f5bfd28c-d9d4-42a5-bc51-d16f6144da67	t
24cbc8d6-ee21-4bbb-8d35-b474b5c6a406	62ec749d-ba99-46ed-acdc-1a5292c9039e	16aa5be4-268d-41c5-9f0e-7c1a969a6dd8	t
98e7502c-63bf-4367-b30f-9b1ea796e6d4	beabc539-6527-4a85-9e39-e998522b563d	4d14ead8-c99c-4063-900c-4abc082f3603	t
2c8b01c8-7e97-4462-bd90-b01066ee3d4a	beabc539-6527-4a85-9e39-e998522b563d	5c480757-9614-4961-9bc0-d82dbdd4a739	t
e0872099-485f-4abd-a70f-ed74e94d6ffa	beabc539-6527-4a85-9e39-e998522b563d	568495ef-43c8-46be-90e7-62e49a7e55e5	t
a3d6b035-fbe9-43d7-8504-ff5d93226a91	beabc539-6527-4a85-9e39-e998522b563d	34336283-1138-47e1-a62c-20de8a097513	t
d4463391-9b29-40e8-aa3f-d166ba2621ba	beabc539-6527-4a85-9e39-e998522b563d	0a3a9249-8f16-4541-9130-ffa06344561c	t
eb6f3ac6-3e1e-41aa-bb54-e5ba8a09e876	beabc539-6527-4a85-9e39-e998522b563d	d828db7e-7740-496f-a9ef-37e7d0fcdbdf	t
80c8f226-e1c8-43e0-9481-4b87f3938f68	beabc539-6527-4a85-9e39-e998522b563d	50106eaa-8fbb-45f2-bff7-169582d94602	t
b32ab6b7-015d-4dfa-8705-9f5a8b726d7a	beabc539-6527-4a85-9e39-e998522b563d	841bea08-516e-40c2-b29a-72d3893f217b	t
01e787d2-01fe-4ec2-abb3-11f782397917	beabc539-6527-4a85-9e39-e998522b563d	d0e48f82-daf6-4f4f-b7ff-5540baa4b1b3	t
fd797eed-8b9a-42c9-b049-0ac0ba3a5632	beabc539-6527-4a85-9e39-e998522b563d	ab723f93-9662-4873-a8e7-afbee6009cea	t
3a7955fe-3495-435c-9323-1470a4960377	beabc539-6527-4a85-9e39-e998522b563d	4a85455e-01d3-4d24-b513-f8da08a6a034	t
500f9066-f989-43db-a35b-25dbd3a0671f	beabc539-6527-4a85-9e39-e998522b563d	1d48b5c6-5976-4bc9-91cc-28d8507f8f4d	t
0b01c1af-7afd-4f14-bec9-43827dcd0d56	beabc539-6527-4a85-9e39-e998522b563d	e1203a09-bd01-4032-ae96-267127584b68	t
02a9a6e6-9ba4-4429-84e5-e550fabcc560	beabc539-6527-4a85-9e39-e998522b563d	6f25efdb-a1c2-40bd-9a71-9ac1bd20495c	t
26d4c34c-2d71-4167-837b-eb651c842005	beabc539-6527-4a85-9e39-e998522b563d	48f20653-37d3-4eec-bc6b-6ba5c5b14586	t
777d79c4-43cc-40f4-8f96-333a0724e54d	beabc539-6527-4a85-9e39-e998522b563d	e41dc645-5978-4d2c-9758-fa28960b8572	t
646ecf90-37e4-4dc2-9e85-deed44ddcbb0	68577b84-82ba-4226-9051-3e7490ad60e1	568495ef-43c8-46be-90e7-62e49a7e55e5	t
1a7cfefd-8f4d-43db-a7df-29c65494001e	68577b84-82ba-4226-9051-3e7490ad60e1	34336283-1138-47e1-a62c-20de8a097513	t
d38df2a0-7892-459d-9570-71e59fa5942b	68577b84-82ba-4226-9051-3e7490ad60e1	d828db7e-7740-496f-a9ef-37e7d0fcdbdf	t
998ebb6b-1b4d-42df-b820-f78d44b25445	68577b84-82ba-4226-9051-3e7490ad60e1	d0e48f82-daf6-4f4f-b7ff-5540baa4b1b3	t
fd26d0e4-87f9-47df-b5f5-2b7007aee950	68577b84-82ba-4226-9051-3e7490ad60e1	4a85455e-01d3-4d24-b513-f8da08a6a034	t
ebcbe3f8-6288-4863-ae6b-15b51b4d28d7	68577b84-82ba-4226-9051-3e7490ad60e1	1d48b5c6-5976-4bc9-91cc-28d8507f8f4d	t
2412259c-5fb1-4ab6-9f2f-737991a122bd	68577b84-82ba-4226-9051-3e7490ad60e1	6f25efdb-a1c2-40bd-9a71-9ac1bd20495c	t
7db5dbb7-eb2c-4280-b31c-c65fd0804aa6	68577b84-82ba-4226-9051-3e7490ad60e1	e41dc645-5978-4d2c-9758-fa28960b8572	t
fc1cf924-3b61-402b-9efe-ea5a86f8e2f4	f87e17d2-6125-47e9-93fd-db9f928258fd	4222e45b-74ee-41f3-88b7-bdbc5907a4b9	t
eb8a7302-6c53-416b-804d-d3f8809e6c2b	f87e17d2-6125-47e9-93fd-db9f928258fd	4482e1eb-1e58-448e-b1c0-1cb65aa7a7a5	t
7cf47e25-dc03-4afa-9862-69be5cd45ca7	f87e17d2-6125-47e9-93fd-db9f928258fd	afea8f06-32d8-40bf-b903-cc51b2457b57	t
c0bd80ca-e5e9-4516-ac00-92974bb277a6	f87e17d2-6125-47e9-93fd-db9f928258fd	1ad83951-8eaf-49ed-9c36-85ac5a94d1c1	t
00774a32-4413-490c-b1a2-55bc7c3ed0db	f87e17d2-6125-47e9-93fd-db9f928258fd	ef5657c6-7628-4e9f-b915-bcaf868ef21d	t
8afe7329-f9f2-47da-a17d-a036ad139ec1	f87e17d2-6125-47e9-93fd-db9f928258fd	7ea3f969-ddff-426c-991a-b89fb9e65a1d	t
47cc560b-7bbb-4e83-b429-150c2c323957	f87e17d2-6125-47e9-93fd-db9f928258fd	e5eed579-aa34-4a6b-9ae9-e8acb8f139ee	t
30b3c9b8-2410-410c-b1bf-aaaf0d30c2e9	f87e17d2-6125-47e9-93fd-db9f928258fd	ab723f93-9662-4873-a8e7-afbee6009cea	t
36c3c483-ddc5-4c4a-a781-cd9eef2b9979	f87e17d2-6125-47e9-93fd-db9f928258fd	ab3ba0d1-c8a9-4c0f-8714-213d1c3cb4b7	t
0eb039b7-bf46-4269-bef6-7e424ff14453	f339690c-016e-414b-b526-4973d58b7f54	9724f098-c399-4068-9f9f-89aff0b3df71	t
acdeb883-5191-47ad-ba84-4ec73afa67cc	f339690c-016e-414b-b526-4973d58b7f54	99e0b0f7-00c5-42f4-b033-aa53caac0599	t
fb59e783-989d-4681-94de-fb94dd0b85cf	f339690c-016e-414b-b526-4973d58b7f54	6074b7e0-8775-4a07-befa-75c88b59a09d	t
fc37c518-6397-4004-a46d-114e32e7b932	f339690c-016e-414b-b526-4973d58b7f54	561f8aae-13ab-4d63-863a-b9886bb12b91	t
2833de62-b3b0-4f92-a116-c360cc0cc779	f339690c-016e-414b-b526-4973d58b7f54	63701aa8-785a-44a2-8958-1ecf3c34d6bf	t
c2ee6a0f-7d57-4520-b279-704499a67e06	f339690c-016e-414b-b526-4973d58b7f54	8aa6ba4a-91ea-4fb2-a46f-bbc673f023dd	t
77969e27-285a-42fd-ba89-c426b4cdefac	f339690c-016e-414b-b526-4973d58b7f54	16f8ac93-4a15-4633-9b21-8d314fa23b32	t
68dc0138-d725-4af9-965e-a740e35454cd	f339690c-016e-414b-b526-4973d58b7f54	6f0b5f08-6c4c-4306-8ad8-061c7d79c083	t
e62832f4-8a41-4f90-b2a1-b260b9f23774	f339690c-016e-414b-b526-4973d58b7f54	4222e45b-74ee-41f3-88b7-bdbc5907a4b9	t
31bce3a6-ce88-4838-aee2-08117dc52cd1	f339690c-016e-414b-b526-4973d58b7f54	ab723f93-9662-4873-a8e7-afbee6009cea	t
f90bed6c-8b3f-46fe-aec5-31e425f40aaf	f339690c-016e-414b-b526-4973d58b7f54	f213ee43-8de0-49fc-821e-249e72c03b6d	t
f3331378-1834-4f8d-b8ab-d43e4df2dfac	f339690c-016e-414b-b526-4973d58b7f54	b68bab70-3141-47ed-9b43-b77abeff81d3	t
410d3f44-67a4-419e-8efd-d3bd9f95f163	5b435a99-7bd3-4f4e-b183-b527d72b663c	4482e1eb-1e58-448e-b1c0-1cb65aa7a7a5	t
\.


--
-- TOC entry 4245 (class 0 OID 16403)
-- Dependencies: 221
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, label, description, "isSystem", created_at) FROM stdin;
62ec749d-ba99-46ed-acdc-1a5292c9039e	admin	Administrator	Full system access	t	2026-03-20 00:06:37.239
beabc539-6527-4a85-9e39-e998522b563d	sales_manager	Sales Manager	Can view/reassign all sales leads	t	2026-03-20 00:06:38.6
68577b84-82ba-4226-9051-3e7490ad60e1	sales_exec	Sales Executive	Can only view own leads	t	2026-03-20 00:06:39.721
f87e17d2-6125-47e9-93fd-db9f928258fd	ops	Operations	Manages tours	t	2026-03-20 00:06:39.745
f339690c-016e-414b-b526-4973d58b7f54	accounts	Accounts	Records payments	t	2026-03-20 00:06:39.765
5b435a99-7bd3-4f4e-b183-b527d72b663c	field_agent	Field Agent	Mobile-only field worker	t	2026-03-20 00:06:39.785
\.


--
-- TOC entry 4271 (class 0 OID 16972)
-- Dependencies: 247
-- Data for Name: room_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room_types (id, name, is_active, deleted_at) FROM stdin;
890eeba5-3b82-4f07-a939-10cb4d5bd225	All type of room - Gangtok	t	2026-04-01 20:35:14.315
f37738ed-45a4-4d21-b543-023f3b7ce759	Kanchenjunga Suite With Balcony	t	\N
f5fec9f1-d84d-4e96-8bb2-da1cd239b123	Superior Room	t	\N
e1ba4151-6631-4b61-943f-8870267d64a7	Comfort Room	t	\N
68501d9f-05d6-4c25-9d4e-435439c91941	Comfort Room With Balcony	t	\N
\.


--
-- TOC entry 4286 (class 0 OID 17230)
-- Dependencies: 262
-- Data for Name: sheet_sync_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sheet_sync_configs (id, name, sheet_url, sheet_id, tab_name, column_mapping, last_sync_at, sync_interval, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4268 (class 0 OID 16934)
-- Dependencies: 244
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, contact_person, email, phone, city, address, is_active, deleted_at, category, company_name) FROM stdin;
ae9fd8d7-cbb7-4137-bb5d-19a7a24c2add	Kushal	Kushal@123	8158033541	Darjeeling	Darjeeling	t	2026-04-23 19:13:39.297	Cab	Cab
52fd54bd-cbad-4d6f-87d8-dee96680dffd	Nupu	nupu@tour	9641110584	Sikkim	Sikkim	t	2026-04-23 19:13:42.934	\N	Innova 
\.


--
-- TOC entry 4278 (class 0 OID 17106)
-- Dependencies: 254
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.testimonials (id, customer_name, rating, text, photo_url, destination, is_active) FROM stdin;
\.


--
-- TOC entry 4258 (class 0 OID 16593)
-- Dependencies: 234
-- Data for Name: tour_cancellations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_cancellations (id, tour_id, reason, refund_amount, status, requested_by, processed_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4257 (class 0 OID 16576)
-- Dependencies: 233
-- Data for Name: tours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tours (id, query_id, proposal_id, tour_code, status, start_date, end_date, total_pax, ops_notes, assigned_ops, deleted_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4270 (class 0 OID 16959)
-- Dependencies: 246
-- Data for Name: transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transfers (id, vehicle_type, destination_id, price, description, is_active, deleted_at, photo_url) FROM stdin;
7e365fd7-6ff7-433b-b6a6-64e2ecd09124	Gangtok – Darjeeling (4 Hour Drive/110 KM)	3134f29d-8635-411f-a6dd-c2562eb7314d	\N	After breakfast, start your journey to Darjeeling, the Queen of Hills. Once you reach Darjeeling, our representative will assist you to check in at the hotel at Darjeeling. Overnight stay at the hotel.	t	\N	\N
a0157c43-7171-4c95-bf0b-4dfc5f709316	Gangtok full day sightseeing	1a9bed23-6d7b-4bb6-9d0b-785221d4f24b	\N	After a delicious breakfast, embark on a journey to explore the famous attractions of Gangtok, the capital city of Sikkim. Located at an elevation of 1,650 m, Gangtok is also the gateway to Sikkim. First, visit the Bakthang Waterfalls which is quite wid	t	\N	\N
09b51c6d-c101-4c46-b928-70169c3338b2	 Darjeeling(Full day local sightseeing)	3134f29d-8635-411f-a6dd-c2562eb7314d	\N	Begin the journey early morning (around 4 am) and drive to the famous Tiger Hill (2590 m) to treat your senses with mind-blowing views of the sunrise over Mt. Kanchenjunga. It is the highest point of this hill station. While coming back from there visit	t	\N	\N
\.


--
-- TOC entry 4297 (class 0 OID 41592)
-- Dependencies: 273
-- Data for Name: trending_destinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trending_destinations (id, region, title, tagline, image, link, last_updated, is_active, sequence) FROM stdin;
9e9ffe10-e70f-4df5-a91a-5f7809eae98f	Royal Rajasthan	Udaipur	The City of Lakes & Palaces	https://images.unsplash.com/photo-1675772120474-b9d7811220f9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D	/destinations/udaipur	April 22, 2026	t	2
54714f01-4327-4292-8773-a9aae7a27d9b	South India Heritage	Munnar	Tropical Tea Sanctuaries	https://images.unsplash.com/photo-1637066742971-726bee8d9f56?q=80&w=2149&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D	/destinations/munnar	April 22, 2026	t	1
\.


--
-- TOC entry 4248 (class 0 OID 16440)
-- Dependencies: 224
-- Data for Name: user_permission_overrides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_permission_overrides (id, user_id, permission_id, granted, reason, set_by, created_at) FROM stdin;
\.


--
-- TOC entry 4250 (class 0 OID 16477)
-- Dependencies: 226
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, refresh_token_hash, device_info, expires_at, created_at) FROM stdin;
d5bcb0ac-9a46-4b96-a916-33932ff2c1ca	510f6989-6adf-4cc6-bd94-96003cd2ae15	$2b$10$WeQhLcj65a.7Y1W19X1Kw.TLtpzaASADgb7wm6DSu7zk3VitQAAoW	Web	2026-06-06 12:55:12.619	2026-05-30 12:55:12.62
d9cdb565-a6d3-4f6b-b6ea-3e0b5edcca9c	510f6989-6adf-4cc6-bd94-96003cd2ae15	$2b$10$Gpjp5qVKkecEwsjDluky7uYy4e0WW2XGmhJiJKOoJt6q2HXkgixOC	Web	2026-06-06 12:55:13.56	2026-05-30 12:55:13.561
5f933fef-28c9-4e74-a7b1-08d4166c89d4	510f6989-6adf-4cc6-bd94-96003cd2ae15	$2b$10$BlEGsU712/KUXidTRtPUmejcLfesb0ZKBuD42hB8jPJUEDT2Q4FPC	Web	2026-06-06 13:12:43.642	2026-05-30 01:56:05.456
aa6441e5-c33e-469c-ac47-4bf5f89f9301	a860dff1-8690-4627-bb5b-faefe169d02f	$2b$10$04p1xRZTh9dNz12xbVmgSucPOPPfbZymWPgvZWQAMPUxfMMKkd8BW	Web	2026-06-10 10:21:12.974	2026-06-03 10:21:12.975
af85c3d8-5e03-4cf3-8304-e358a59ba6a6	a860dff1-8690-4627-bb5b-faefe169d02f	$2b$10$a8S7xENxS6B0.Da5ZfzBJOKtZqBKs/3x3ZTx4feohHKzG7N9kjly6	Web	2026-06-08 13:14:54.983	2026-06-01 13:14:54.988
f0876a3f-60d0-46b9-a540-d2775911c1e4	a860dff1-8690-4627-bb5b-faefe169d02f	$2b$10$jHnglViorIOajL464Uhz5OQZFZr1MagX8IcfwZK/3aHahQX46oYfS	Web	2026-06-09 08:02:01.72	2026-05-30 10:41:49.625
\.


--
-- TOC entry 4249 (class 0 OID 16454)
-- Dependencies: 225
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role_id, is_active, mobile_only, is_on_leave, leave_until, max_leads, last_assigned_at, created_by, created_at, updated_at, department, mobile, mobile2, profile_photo, branch_id) FROM stdin;
78e1048f-3584-4f57-a821-306e2fda5816	AMAN SHARMA	amanasha481@gmail.com	$2b$12$CAzzh2kib0sGn4Xyibs3Y.No03hmZkF5IeOhYlOs3Igrxg7fBk2We	62ec749d-ba99-46ed-acdc-1a5292c9039e	t	f	f	\N	50	2026-03-25 13:00:49.039	\N	2026-03-24 21:48:15.29	2026-03-25 13:00:49.04	\N	\N	\N	\N	\N
510f6989-6adf-4cc6-bd94-96003cd2ae15	Anish	anish629028@gmail.com	$2b$12$P1np.qZWAZsW5V6Bh82koeh.iFZW5mBAgxxKp/2b7YVQg2M8l/kKC	62ec749d-ba99-46ed-acdc-1a5292c9039e	t	t	f	\N	50	2026-03-22 14:41:55.402	\N	2026-03-20 00:06:43.259	2026-04-03 03:51:42.747			\N	\N	\N
a860dff1-8690-4627-bb5b-faefe169d02f	HARSH ANAND	harshbuddy01@gmail.com	$2b$12$p/ks2FqKMW3t3DoVxKyO0Osgk1WwyMh0rByfZw/TvAIt21vjNcfma	62ec749d-ba99-46ed-acdc-1a5292c9039e	t	f	f	\N	50	2026-04-09 19:09:00.291	\N	2026-03-24 21:14:17.79	2026-04-09 19:09:00.292			\N	\N	\N
\.


--
-- TOC entry 4285 (class 0 OID 17215)
-- Dependencies: 261
-- Data for Name: vendor_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendor_payments (id, supplier_id, vendor_name, amount, mode, reference_id, payment_date, tour_id, notes, recorded_by, created_at, deleted_at, updated_at, query_id) FROM stdin;
353d35bc-becd-4e22-984b-613a4650f63b	\N	hotel	4800.00	upi	6286238	2026-03-26	\N		a860dff1-8690-4627-bb5b-faefe169d02f	2026-03-26 23:20:21.08	\N	2026-03-26 23:20:21.08	\N
\.


--
-- TOC entry 4289 (class 0 OID 17334)
-- Dependencies: 265
-- Data for Name: vouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vouchers (id, query_id, booking_service_id, voucher_type, voucher_number, confirmation_number, supplier_name, hotel_name, destination, lead_pax_name, pax_details, check_in, check_out, room_type, meal_plan, greeting_message, pdf_url, status, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 4296 (class 0 OID 41579)
-- Dependencies: 272
-- Data for Name: website_journey_days; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.website_journey_days (id, journey_id, day_number, title, date, "time", description, image) FROM stdin;
d9afe987-367d-4762-8c03-644ecf25b9a9	2522cf66-d668-4373-bd5b-09b1b9c17c8e	1	Discover Gangtok	1 Nov	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of SIKKIM. Expert guided explorations wait for you.	https://images.pexels.com/photos/33248529/pexels-photo-33248529.jpeg?auto=compress&cs=tinysrgb&w=1600
51e1c485-3780-41ac-85ff-c652d1d8efe6	2522cf66-d668-4373-bd5b-09b1b9c17c8e	2	Discover Lachung	2 Nov	Departure 10:00	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of SIKKIM. Expert guided explorations wait for you.	https://images.pexels.com/photos/34032592/pexels-photo-34032592.jpeg?auto=compress&cs=tinysrgb&w=1600
cc4526a6-746c-4777-8c75-c26dc8c80f5a	3ab4bda6-af96-4750-8e80-f48de70176d7	1	Discover Gangtok	3 Nov	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of SIKKIM. Expert guided explorations wait for you.	https://images.pexels.com/photos/33547415/pexels-photo-33547415.jpeg?auto=compress&cs=tinysrgb&w=1600
278fc0b7-6727-4d8c-8865-1a968f408584	3ab4bda6-af96-4750-8e80-f48de70176d7	2	Discover Nathula	4 Nov	Departure 10:00	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of SIKKIM. Expert guided explorations wait for you.	https://images.pexels.com/photos/34032592/pexels-photo-34032592.jpeg?auto=compress&cs=tinysrgb&w=1600
bd4bfef0-51c0-41f2-bc47-dac563f02707	85f648c9-316c-482e-abb9-48c9f8641c28	1	Discover Bagdogra	5 Nov	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/33676436/pexels-photo-33676436.jpeg?auto=compress&cs=tinysrgb&w=1600
29d22fab-7e5a-4956-9395-20170df19df7	85f648c9-316c-482e-abb9-48c9f8641c28	2	Discover Kurseong	6 Nov	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/31758870/pexels-photo-31758870.jpeg?auto=compress&cs=tinysrgb&w=1600
bb416144-2e4d-4bda-9754-24cd1622e163	85f648c9-316c-482e-abb9-48c9f8641c28	3	Discover Darjeeling	7 Nov	Full Day	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/2408962/pexels-photo-2408962.jpeg?auto=compress&cs=tinysrgb&w=1600
7cfef711-5ecb-46ae-b227-d84ce2ba3db5	85f648c9-316c-482e-abb9-48c9f8641c28	4	Discover Kalimpong	8 Nov	Full Day	Immerse yourself on Day 4 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/15138292/pexels-photo-15138292.jpeg?auto=compress&cs=tinysrgb&w=1600
a22cdc36-056f-4592-b83e-03c12586830f	85f648c9-316c-482e-abb9-48c9f8641c28	5	Discover Mirik	9 Nov	Departure 10:00	Immerse yourself on Day 5 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/6741747/pexels-photo-6741747.jpeg?auto=compress&cs=tinysrgb&w=1600
63f5c65f-bc1c-4ac0-b849-7c19e5aab23d	da774856-b601-477c-a273-38493b1e7808	1	Discover Darjeeling	7 Nov	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/19082530/pexels-photo-19082530.jpeg?auto=compress&cs=tinysrgb&w=1600
11d6ec2d-b4ee-493e-91c6-a7bcbe334181	da774856-b601-477c-a273-38493b1e7808	2	Discover Ghoom	8 Nov	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/15138292/pexels-photo-15138292.jpeg?auto=compress&cs=tinysrgb&w=1600
04e5f81c-66a3-439b-8969-22ce0f5e4772	da774856-b601-477c-a273-38493b1e7808	3	Discover Kurseong	9 Nov	Departure 10:00	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/33263644/pexels-photo-33263644.jpeg?auto=compress&cs=tinysrgb&w=1600
ecc0000d-cea6-41dc-93e9-e62d3076862f	b38c1d0e-0b21-411c-b987-f6e22feecc2e	1	Discover Cochin	9 Dec	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/20035184/pexels-photo-20035184.jpeg?auto=compress&cs=tinysrgb&w=1600
fe6984b0-6bd2-42a9-bb1f-90e2e8ab7a60	b38c1d0e-0b21-411c-b987-f6e22feecc2e	2	Discover Alleppey	10 Dec	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/17545322/pexels-photo-17545322.jpeg?auto=compress&cs=tinysrgb&w=1600
21d1fb15-541b-49ea-b869-415d02dc5db2	b38c1d0e-0b21-411c-b987-f6e22feecc2e	3	Discover Kumarakom	11 Dec	Full Day	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/30561587/pexels-photo-30561587.jpeg?auto=compress&cs=tinysrgb&w=1600
c86322ba-763a-40e9-bc70-7e1c860d7e81	b38c1d0e-0b21-411c-b987-f6e22feecc2e	4	Discover Munnar	12 Dec	Full Day	Immerse yourself on Day 4 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/8964871/pexels-photo-8964871.jpeg?auto=compress&cs=tinysrgb&w=1600
ea0e8167-eb14-4a4e-a521-32fd29e029f6	b38c1d0e-0b21-411c-b987-f6e22feecc2e	5	Discover Thekkady	13 Dec	Departure 10:00	Immerse yourself on Day 5 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/14922662/pexels-photo-14922662.jpeg?auto=compress&cs=tinysrgb&w=1600
baf03326-6ce1-43f8-80aa-a901ae7b7711	e0d53898-aa52-4c6d-9d89-92bc0f7abf24	1	Discover Cochin	11 Dec	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/8964871/pexels-photo-8964871.jpeg?auto=compress&cs=tinysrgb&w=1600
2e5607c3-f439-4cd5-9fac-6cb8bb636ce2	e0d53898-aa52-4c6d-9d89-92bc0f7abf24	2	Discover Munnar	12 Dec	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/14922662/pexels-photo-14922662.jpeg?auto=compress&cs=tinysrgb&w=1600
c6628d47-f1df-41b6-b849-c45abd812a9e	e0d53898-aa52-4c6d-9d89-92bc0f7abf24	3	Discover Chinnar	13 Dec	Full Day	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/20035184/pexels-photo-20035184.jpeg?auto=compress&cs=tinysrgb&w=1600
11a6ef80-07bd-498d-8008-e4f9fc8f786c	e0d53898-aa52-4c6d-9d89-92bc0f7abf24	4	Discover Marayoor	14 Dec	Full Day	Immerse yourself on Day 4 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/17545322/pexels-photo-17545322.jpeg?auto=compress&cs=tinysrgb&w=1600
c177a6fb-4303-4b4c-a8b4-54934b031576	e0d53898-aa52-4c6d-9d89-92bc0f7abf24	5	Discover Thekkady	15 Dec	Departure 10:00	Immerse yourself on Day 5 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/18151791/pexels-photo-18151791.jpeg?auto=compress&cs=tinysrgb&w=1600
c87b9a52-3cbd-49de-807a-a4d043ce0870	c98e059e-592d-4bea-a952-9eac9ee7a8a3	1	Discover Dabolim	13 Dec	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of GOA. Expert guided explorations wait for you.	https://images.pexels.com/photos/11442148/pexels-photo-11442148.jpeg?auto=compress&cs=tinysrgb&w=1600
c747d128-aad7-4717-a4df-c24a2f10298d	c98e059e-592d-4bea-a952-9eac9ee7a8a3	2	Discover Panjim	14 Dec	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of GOA. Expert guided explorations wait for you.	https://images.pexels.com/photos/29236033/pexels-photo-29236033.jpeg?auto=compress&cs=tinysrgb&w=1600
bcfdc63f-6e4b-41e3-b47a-25bd6f22c05e	c98e059e-592d-4bea-a952-9eac9ee7a8a3	3	Discover Morjim	15 Dec	Departure 10:00	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of GOA. Expert guided explorations wait for you.	https://images.pexels.com/photos/20717139/pexels-photo-20717139.jpeg?auto=compress&cs=tinysrgb&w=1600
d3c87fd4-7b0e-4fb6-8170-3b9288f88028	1e3f87bb-a57b-4ce1-9e10-3bda9b2703cc	1	Discover Panjim	15 Dec	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of GOA. Expert guided explorations wait for you.	https://images.pexels.com/photos/2432269/pexels-photo-2432269.jpeg?auto=compress&cs=tinysrgb&w=1600
0f032a08-06e2-44b4-be5c-33fc8e9fcd08	1e3f87bb-a57b-4ce1-9e10-3bda9b2703cc	2	Discover Dudhsagar	16 Dec	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of GOA. Expert guided explorations wait for you.	https://images.pexels.com/photos/11442148/pexels-photo-11442148.jpeg?auto=compress&cs=tinysrgb&w=1600
eb860106-0759-41ec-9a76-0abc0d7e4975	1e3f87bb-a57b-4ce1-9e10-3bda9b2703cc	3	Discover Tambdi Surla	17 Dec	Departure 10:00	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of GOA. Expert guided explorations wait for you.	https://images.pexels.com/photos/29236033/pexels-photo-29236033.jpeg?auto=compress&cs=tinysrgb&w=1600
d6f7991b-c14d-4151-9c50-f7a5940c4347	72a5ac3f-6a90-44ea-8f71-fa1d016aa530	1	Discover Jaipur	17 Jan	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/19905363/pexels-photo-19905363.jpeg?auto=compress&cs=tinysrgb&w=1600
2e88f4a9-ddd8-4aa6-b991-d4a9dbc209f9	72a5ac3f-6a90-44ea-8f71-fa1d016aa530	2	Discover Jodhpur	18 Jan	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/19438328/pexels-photo-19438328.jpeg?auto=compress&cs=tinysrgb&w=1600
ae8c5cce-56b3-4dea-831e-54c80cf267aa	72a5ac3f-6a90-44ea-8f71-fa1d016aa530	3	Discover Udaipur	19 Jan	Full Day	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/33230288/pexels-photo-33230288.jpeg?auto=compress&cs=tinysrgb&w=1600
32717c56-0e2d-493f-973f-10751608a748	72a5ac3f-6a90-44ea-8f71-fa1d016aa530	4	Discover Jaisalmer	20 Jan	Full Day	Immerse yourself on Day 4 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/34913209/pexels-photo-34913209.jpeg?auto=compress&cs=tinysrgb&w=1600
658d28b9-fbef-4e7a-ad7b-da0be46a3405	72a5ac3f-6a90-44ea-8f71-fa1d016aa530	5	Discover Bikaner	21 Jan	Departure 10:00	Immerse yourself on Day 5 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/28494456/pexels-photo-28494456.jpeg?auto=compress&cs=tinysrgb&w=1600
459cd133-03ba-4078-be2b-ed7ad7c8f949	56fce2b7-fe3b-4aa0-a4c7-ce51804d0051	1	Discover Jaisalmer	19 Jan	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/33726141/pexels-photo-33726141.jpeg?auto=compress&cs=tinysrgb&w=1600
fd844def-c5f5-473d-9eaa-5d4112251c76	56fce2b7-fe3b-4aa0-a4c7-ce51804d0051	2	Discover Thar Desert	20 Jan	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/32261839/pexels-photo-32261839.jpeg?auto=compress&cs=tinysrgb&w=1600
f0186300-c7e7-4ced-a106-999b7a1f3b6d	56fce2b7-fe3b-4aa0-a4c7-ce51804d0051	3	Discover Jodhpur	21 Jan	Departure 10:00	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/35394354/pexels-photo-35394354.jpeg?auto=compress&cs=tinysrgb&w=1600
ef6c7661-0c21-472e-88f7-f1e73d1b6cbc	3b865d98-2962-4267-923c-79b767a768cf	1	Discover Udaipur	21 Jan	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/15828299/pexels-photo-15828299.jpeg?auto=compress&cs=tinysrgb&w=1600
3d273c3a-6014-4906-8353-bb17c648350a	3b865d98-2962-4267-923c-79b767a768cf	2	Discover Mount Abu	22 Jan	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/33230288/pexels-photo-33230288.jpeg?auto=compress&cs=tinysrgb&w=1600
048905a7-5eae-4db7-ab92-447b8923e239	3b865d98-2962-4267-923c-79b767a768cf	3	Discover Kumbhalgarh	23 Jan	Full Day	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/12912712/pexels-photo-12912712.jpeg?auto=compress&cs=tinysrgb&w=1600
973bf7d7-9045-4927-8aa2-d066baafc9ca	3b865d98-2962-4267-923c-79b767a768cf	4	Discover Chittorgarh	24 Jan	Full Day	Immerse yourself on Day 4 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/15534234/pexels-photo-15534234.jpeg?auto=compress&cs=tinysrgb&w=1600
57a10fef-7588-4968-8698-8627be24e9c4	3b865d98-2962-4267-923c-79b767a768cf	5	Discover Jaipur	25 Jan	Full Day	Immerse yourself on Day 5 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/31739860/pexels-photo-31739860.jpeg?auto=compress&cs=tinysrgb&w=1600
b772f881-264a-433a-94aa-82a14e6d5a1e	3b865d98-2962-4267-923c-79b767a768cf	6	Discover Udaipur	26 Jan	Departure 10:00	Immerse yourself on Day 6 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/19195937/pexels-photo-19195937.jpeg?auto=compress&cs=tinysrgb&w=1600
b8c81bc7-b90b-4a9c-851d-975db0c7a0d9	e2888b14-fc06-46b9-bc9a-72ee6a0b2705	1	Discover Gangtok	23 Jan	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of SIKKIM. Expert guided explorations wait for you.	https://images.pexels.com/photos/34032592/pexels-photo-34032592.jpeg?auto=compress&cs=tinysrgb&w=1600
89a74200-1fe2-4452-9249-3304ebf2271b	e2888b14-fc06-46b9-bc9a-72ee6a0b2705	2	Discover Lachung	24 Jan	Departure 10:00	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of SIKKIM. Expert guided explorations wait for you.	https://images.pexels.com/photos/33547415/pexels-photo-33547415.jpeg?auto=compress&cs=tinysrgb&w=1600
c1bd92b6-9e62-4270-8a1e-db133dcea37c	e8d9992a-c836-424d-a011-83ee01ce5376	1	Discover Gangtok	25 Feb	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of SIKKIM. Expert guided explorations wait for you.	https://images.pexels.com/photos/35431355/pexels-photo-35431355.jpeg?auto=compress&cs=tinysrgb&w=1600
7a74ca11-66cd-4820-ae29-49949668b3cf	e8d9992a-c836-424d-a011-83ee01ce5376	2	Discover Nathula	26 Feb	Departure 10:00	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of SIKKIM. Expert guided explorations wait for you.	https://images.pexels.com/photos/34032592/pexels-photo-34032592.jpeg?auto=compress&cs=tinysrgb&w=1600
188b1482-c502-4f68-a1a3-0ddce6b53985	e39666c8-b998-4cd9-bdb9-da13d60bd80d	1	Discover Bagdogra	27 Feb	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/33263644/pexels-photo-33263644.jpeg?auto=compress&cs=tinysrgb&w=1600
8ad66781-2586-46b7-9142-a6938822d170	e39666c8-b998-4cd9-bdb9-da13d60bd80d	2	Discover Kurseong	28 Feb	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/18943817/pexels-photo-18943817.jpeg?auto=compress&cs=tinysrgb&w=1600
58c8daa8-ecd1-4e00-a556-4b9233990974	e39666c8-b998-4cd9-bdb9-da13d60bd80d	3	Discover Darjeeling	1 Mar	Full Day	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/33676436/pexels-photo-33676436.jpeg?auto=compress&cs=tinysrgb&w=1600
c0476dfd-187b-460d-a6b1-66b9fa36724a	e39666c8-b998-4cd9-bdb9-da13d60bd80d	4	Discover Kalimpong	2 Mar	Departure 10:00	Immerse yourself on Day 4 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/19082530/pexels-photo-19082530.jpeg?auto=compress&cs=tinysrgb&w=1600
959b6e94-3cd3-4f1b-8fb1-ce261365f57b	e9fdfab0-58d1-45b5-900e-ef1b80785cb7	1	Discover Darjeeling	1 Mar	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/33736751/pexels-photo-33736751.jpeg?auto=compress&cs=tinysrgb&w=1600
49741151-bed7-4c36-8d9b-07baaf2b02fe	e9fdfab0-58d1-45b5-900e-ef1b80785cb7	2	Discover Ghoom	2 Mar	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/30778897/pexels-photo-30778897.jpeg?auto=compress&cs=tinysrgb&w=1600
5eed7648-2f7e-44dc-9bf3-9007382a02cf	e9fdfab0-58d1-45b5-900e-ef1b80785cb7	3	Discover Kurseong	3 Mar	Full Day	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/19082530/pexels-photo-19082530.jpeg?auto=compress&cs=tinysrgb&w=1600
5136dcd1-f933-4ff8-a56b-ad332c4b5ed9	e9fdfab0-58d1-45b5-900e-ef1b80785cb7	4	Discover Kalimpong	4 Mar	Full Day	Immerse yourself on Day 4 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/34087894/pexels-photo-34087894.jpeg?auto=compress&cs=tinysrgb&w=1600
8db8df0b-2ab7-44dc-8fa3-9582640f5323	e9fdfab0-58d1-45b5-900e-ef1b80785cb7	5	Discover Sandakphu	5 Mar	Departure 10:00	Immerse yourself on Day 5 in the beautifully authentic geographic surroundings of DARJEELING. Expert guided explorations wait for you.	https://images.pexels.com/photos/18943817/pexels-photo-18943817.jpeg?auto=compress&cs=tinysrgb&w=1600
8cb8f90b-d89a-4163-b2e5-df12e9ec7f2e	7c6b4e3e-c73d-4f5c-8bbe-45df3efbae05	1	Discover Cochin	3 Mar	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/5374231/pexels-photo-5374231.jpeg?auto=compress&cs=tinysrgb&w=1600
1374a49b-a59c-4bbb-84a8-27ef1a4be337	7c6b4e3e-c73d-4f5c-8bbe-45df3efbae05	2	Discover Alleppey	4 Mar	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/18151791/pexels-photo-18151791.jpeg?auto=compress&cs=tinysrgb&w=1600
1b5f525f-3050-45bc-a309-fc4a49c9534b	7c6b4e3e-c73d-4f5c-8bbe-45df3efbae05	3	Discover Kumarakom	5 Mar	Departure 10:00	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/8964871/pexels-photo-8964871.jpeg?auto=compress&cs=tinysrgb&w=1600
776f3630-3209-41ed-9e46-3268f16661b8	c17aae7c-803f-4006-9093-8e1e60b56f17	1	Discover Cochin	2 Apr	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/8964871/pexels-photo-8964871.jpeg?auto=compress&cs=tinysrgb&w=1600
e7d60bee-68a9-4a42-8f5b-7d2a45cd600e	c17aae7c-803f-4006-9093-8e1e60b56f17	2	Discover Munnar	3 Apr	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/14922662/pexels-photo-14922662.jpeg?auto=compress&cs=tinysrgb&w=1600
6da9b628-875c-426a-9006-c3f737fdeb19	c17aae7c-803f-4006-9093-8e1e60b56f17	3	Discover Chinnar	4 Apr	Full Day	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/5374231/pexels-photo-5374231.jpeg?auto=compress&cs=tinysrgb&w=1600
fbd40466-c362-4b9c-b0cc-bc6902a4183e	c17aae7c-803f-4006-9093-8e1e60b56f17	4	Discover Marayoor	5 Apr	Full Day	Immerse yourself on Day 4 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/30561587/pexels-photo-30561587.jpeg?auto=compress&cs=tinysrgb&w=1600
07e71668-238b-4b91-9d9d-2b0407c7aa74	c17aae7c-803f-4006-9093-8e1e60b56f17	5	Discover Thekkady	6 Apr	Departure 10:00	Immerse yourself on Day 5 in the beautifully authentic geographic surroundings of KERALA. Expert guided explorations wait for you.	https://images.pexels.com/photos/18151791/pexels-photo-18151791.jpeg?auto=compress&cs=tinysrgb&w=1600
6647c464-0908-4ee8-aadb-d12e52a1acad	24ee0961-b72b-4a95-a870-11110c0d4821	1	Discover Dabolim	4 Apr	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of GOA. Expert guided explorations wait for you.	https://images.pexels.com/photos/11442148/pexels-photo-11442148.jpeg?auto=compress&cs=tinysrgb&w=1600
a147edf8-0a6d-406b-8c56-9255f00e9c1f	24ee0961-b72b-4a95-a870-11110c0d4821	2	Discover Panjim	5 Apr	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of GOA. Expert guided explorations wait for you.	https://images.pexels.com/photos/2432269/pexels-photo-2432269.jpeg?auto=compress&cs=tinysrgb&w=1600
9d23d4dc-bee9-4fd9-81b9-62456a67b87f	24ee0961-b72b-4a95-a870-11110c0d4821	3	Discover Morjim	6 Apr	Departure 10:00	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of GOA. Expert guided explorations wait for you.	https://images.pexels.com/photos/20717139/pexels-photo-20717139.jpeg?auto=compress&cs=tinysrgb&w=1600
0295cae3-48c8-4c15-8a6f-7c67b08feb7c	dd602458-63f8-4886-85dd-1cb4eb28b660	1	Discover Panjim	6 Apr	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of GOA. Expert guided explorations wait for you.	https://images.pexels.com/photos/20717139/pexels-photo-20717139.jpeg?auto=compress&cs=tinysrgb&w=1600
c4838062-33aa-4428-ba34-6e7d5c7c51af	dd602458-63f8-4886-85dd-1cb4eb28b660	2	Discover Dudhsagar	7 Apr	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of GOA. Expert guided explorations wait for you.	https://images.pexels.com/photos/32262471/pexels-photo-32262471.jpeg?auto=compress&cs=tinysrgb&w=1600
c373b1d7-2051-40a5-b4df-0d8dd0f7b96b	dd602458-63f8-4886-85dd-1cb4eb28b660	3	Discover Tambdi Surla	8 Apr	Departure 10:00	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of GOA. Expert guided explorations wait for you.	https://images.pexels.com/photos/20717176/pexels-photo-20717176.jpeg?auto=compress&cs=tinysrgb&w=1600
e13843d1-639d-48e9-ab4f-9e66fef41a3c	8243b5fa-831f-438b-b366-6801af2e4ab8	1	Discover Jaipur	8 Apr	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/17831363/pexels-photo-17831363.jpeg?auto=compress&cs=tinysrgb&w=1600
e22459f2-b917-489b-a53e-e93edf9e7765	8243b5fa-831f-438b-b366-6801af2e4ab8	2	Discover Jodhpur	9 Apr	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/12912712/pexels-photo-12912712.jpeg?auto=compress&cs=tinysrgb&w=1600
166a0415-da4d-465c-9fe1-8daf5bc97e28	8243b5fa-831f-438b-b366-6801af2e4ab8	3	Discover Udaipur	10 Apr	Full Day	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/28494456/pexels-photo-28494456.jpeg?auto=compress&cs=tinysrgb&w=1600
ac2ff87d-ec74-44ce-903b-d275a548f131	8243b5fa-831f-438b-b366-6801af2e4ab8	4	Discover Jaisalmer	11 Apr	Departure 10:00	Immerse yourself on Day 4 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/34913209/pexels-photo-34913209.jpeg?auto=compress&cs=tinysrgb&w=1600
660a3e31-c592-4a86-8edd-920345ebff34	99036784-ea87-42d9-9ec0-a714566728be	1	Discover Jaisalmer	11 May	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/33106473/pexels-photo-33106473.jpeg?auto=compress&cs=tinysrgb&w=1600
220ccdaf-9bd7-41b9-b79b-34e650d4e245	99036784-ea87-42d9-9ec0-a714566728be	2	Discover Thar Desert	12 May	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/15828299/pexels-photo-15828299.jpeg?auto=compress&cs=tinysrgb&w=1600
f6638043-1c92-4451-98e5-3c2a4f260bad	99036784-ea87-42d9-9ec0-a714566728be	3	Discover Jodhpur	13 May	Full Day	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/34913209/pexels-photo-34913209.jpeg?auto=compress&cs=tinysrgb&w=1600
71bb3bab-1718-47ed-87ae-d17d7f6e53ac	99036784-ea87-42d9-9ec0-a714566728be	4	Discover Pushkar	14 May	Full Day	Immerse yourself on Day 4 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/19905363/pexels-photo-19905363.jpeg?auto=compress&cs=tinysrgb&w=1600
53c706c9-5666-4143-b94d-2ab6a85ebf45	99036784-ea87-42d9-9ec0-a714566728be	5	Discover Jaipur	15 May	Departure 10:00	Immerse yourself on Day 5 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/19160085/pexels-photo-19160085.jpeg?auto=compress&cs=tinysrgb&w=1600
ff944b91-8b59-43d4-8e6d-20bb1911210c	c2416a7c-0313-4b5e-951f-617473315d3f	1	Discover Udaipur	13 May	Arrival 12:00	Immerse yourself on Day 1 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/33726141/pexels-photo-33726141.jpeg?auto=compress&cs=tinysrgb&w=1600
b449280c-5385-4171-867d-d8e9b44e23f6	c2416a7c-0313-4b5e-951f-617473315d3f	2	Discover Mount Abu	14 May	Full Day	Immerse yourself on Day 2 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/19438328/pexels-photo-19438328.jpeg?auto=compress&cs=tinysrgb&w=1600
cee56cc8-914a-4b57-8288-58ce919b4abb	c2416a7c-0313-4b5e-951f-617473315d3f	3	Discover Kumbhalgarh	15 May	Departure 10:00	Immerse yourself on Day 3 in the beautifully authentic geographic surroundings of RAJASTHAN. Expert guided explorations wait for you.	https://images.pexels.com/photos/28494456/pexels-photo-28494456.jpeg?auto=compress&cs=tinysrgb&w=1600
\.


--
-- TOC entry 4295 (class 0 OID 41545)
-- Dependencies: 271
-- Data for Name: website_journeys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.website_journeys (id, slug, title, regions, duration_nights, duration_days, price_per_guest, original_price, departure_port, return_port, departure_date, return_date, ports, countries, vehicle, badges, images, map_image, overview, is_active, sequence, created_at, updated_at) FROM stdin;
3ab4bda6-af96-4750-8e80-f48de70176d7	sikkim-journey-1	2-Day Himalayan Ridge Retreat Expedition	NORTH-EAST INDIA & SIKKIM	1	2	23500	27025	Gangtok	Nathula	3 Nov 2026	5 Nov 2026	2	1	Premium SUV	["SIKKIM"]	["https://images.pexels.com/photos/30156563/pexels-photo-30156563.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/35431355/pexels-photo-35431355.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/33248529/pexels-photo-33248529.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of NORTH-EAST INDIA & SIKKIM. Experience luxury and impeccable service along every stop of this curated journey.	t	1	2026-04-23 12:33:49.185	2026-04-23 12:33:49.185
85f648c9-316c-482e-abb9-48c9f8641c28	darjeeling-journey-2	5-Day Darjeeling Tea Trails Retreat	EAST INDIA & BENGAL	4	5	36000	41400	Bagdogra	Mirik	5 Nov 2026	10 Nov 2026	5	1	Premium SUV	["DARJEELING"]	["https://images.pexels.com/photos/33263644/pexels-photo-33263644.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/33736751/pexels-photo-33736751.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/36964491/pexels-photo-36964491.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of EAST INDIA & BENGAL. Experience luxury and impeccable service along every stop of this curated journey.	t	2	2026-04-23 12:33:49.201	2026-04-23 12:33:49.201
da774856-b601-477c-a273-38493b1e7808	darjeeling-journey-3	3-Day Colonial Himalayan Escape Journey	EAST INDIA & BENGAL	2	3	28500	32775	Darjeeling	Kurseong	7 Nov 2026	10 Nov 2026	3	1	Premium SUV	["DARJEELING"]	["https://images.pexels.com/photos/30778897/pexels-photo-30778897.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/36964491/pexels-photo-36964491.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/34087894/pexels-photo-34087894.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of EAST INDIA & BENGAL. Experience luxury and impeccable service along every stop of this curated journey.	t	3	2026-04-23 12:33:49.218	2026-04-23 12:33:49.218
b38c1d0e-0b21-411c-b987-f6e22feecc2e	kerala-journey-4	5-Day Kerala Backwaters & Hills Adventure	SOUTH INDIA & KERALA	4	5	37000	42550	Cochin	Thekkady	9 Dec 2026	14 Dec 2026	5	1	Premium SUV	["KERALA"]	["https://images.pexels.com/photos/18151791/pexels-photo-18151791.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/5374231/pexels-photo-5374231.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/34713309/pexels-photo-34713309.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of SOUTH INDIA & KERALA. Experience luxury and impeccable service along every stop of this curated journey.	t	4	2026-04-23 12:33:49.236	2026-04-23 12:33:49.236
e0d53898-aa52-4c6d-9d89-92bc0f7abf24	kerala-journey-5	5-Day Munnar Tea Estate Retreat Escape	SOUTH INDIA & KERALA	4	5	37500	43125	Cochin	Thekkady	11 Dec 2026	16 Dec 2026	5	1	Premium SUV	["KERALA"]	["https://images.pexels.com/photos/5374231/pexels-photo-5374231.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/30561587/pexels-photo-30561587.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/34713309/pexels-photo-34713309.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of SOUTH INDIA & KERALA. Experience luxury and impeccable service along every stop of this curated journey.	t	5	2026-04-23 12:33:49.254	2026-04-23 12:33:49.254
c98e059e-592d-4bea-a952-9eac9ee7a8a3	goa-journey-6	3-Day Coastal Luxury Escape Expedition	WEST INDIA & GOA	2	3	30000	34500	Dabolim	Morjim	13 Dec 2026	16 Dec 2026	3	1	Premium SUV	["GOA"]	["https://images.pexels.com/photos/32262471/pexels-photo-32262471.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/20717176/pexels-photo-20717176.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/2432269/pexels-photo-2432269.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of WEST INDIA & GOA. Experience luxury and impeccable service along every stop of this curated journey.	t	6	2026-04-23 12:33:49.272	2026-04-23 12:33:49.272
1e3f87bb-a57b-4ce1-9e10-3bda9b2703cc	goa-journey-7	3-Day Cataract & Cave Expedition Retreat	WEST INDIA & GOA	2	3	30500	35075	Panjim	Tambdi Surla	15 Dec 2026	18 Dec 2026	3	1	Premium SUV	["GOA"]	["https://images.pexels.com/photos/32262471/pexels-photo-32262471.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/20717139/pexels-photo-20717139.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/20717176/pexels-photo-20717176.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of WEST INDIA & GOA. Experience luxury and impeccable service along every stop of this curated journey.	t	7	2026-04-23 12:33:49.289	2026-04-23 12:33:49.289
72a5ac3f-6a90-44ea-8f71-fa1d016aa530	rajasthan-journey-8	5-Day Royal Rajasthan Odyssey Journey	NORTH INDIA & RAJASTHAN	4	5	39000	44850	Jaipur	Bikaner	17 Jan 2027	22 Jan 2027	5	1	Premium SUV	["RAJASTHAN"]	["https://images.pexels.com/photos/31739860/pexels-photo-31739860.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/33106473/pexels-photo-33106473.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/31739859/pexels-photo-31739859.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of NORTH INDIA & RAJASTHAN. Experience luxury and impeccable service along every stop of this curated journey.	t	8	2026-04-23 12:33:49.306	2026-04-23 12:33:49.306
56fce2b7-fe3b-4aa0-a4c7-ce51804d0051	rajasthan-journey-9	3-Day Golden Desert Splendour Adventure	NORTH INDIA & RAJASTHAN	2	3	31500	36225	Jaisalmer	Jodhpur	19 Jan 2027	22 Jan 2027	3	1	Premium SUV	["RAJASTHAN"]	["https://images.pexels.com/photos/31739859/pexels-photo-31739859.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/15534234/pexels-photo-15534234.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/33106473/pexels-photo-33106473.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of NORTH INDIA & RAJASTHAN. Experience luxury and impeccable service along every stop of this curated journey.	t	9	2026-04-23 12:33:49.324	2026-04-23 12:33:49.324
3b865d98-2962-4267-923c-79b767a768cf	rajasthan-journey-10	6-Day City of Lakes Luxury Escape	NORTH INDIA & RAJASTHAN	5	6	44000	50600	Udaipur	Jaipur	21 Jan 2027	27 Jan 2027	5	1	Premium SUV	["RAJASTHAN"]	["https://images.pexels.com/photos/19160085/pexels-photo-19160085.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/33106473/pexels-photo-33106473.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/19905363/pexels-photo-19905363.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of NORTH INDIA & RAJASTHAN. Experience luxury and impeccable service along every stop of this curated journey.	t	10	2026-04-23 12:33:49.34	2026-04-23 12:33:49.34
e2888b14-fc06-46b9-bc9a-72ee6a0b2705	sikkim-journey-11	2-Day Sikkim Explorer Expedition	NORTH-EAST INDIA & SIKKIM	1	2	28500	32775	Gangtok	Lachung	23 Jan 2027	25 Jan 2027	2	1	Premium SUV	["SIKKIM"]	["https://images.pexels.com/photos/35431355/pexels-photo-35431355.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/30156563/pexels-photo-30156563.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/33248529/pexels-photo-33248529.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of NORTH-EAST INDIA & SIKKIM. Experience luxury and impeccable service along every stop of this curated journey.	t	11	2026-04-23 12:33:49.364	2026-04-23 12:33:49.364
e8d9992a-c836-424d-a011-83ee01ce5376	sikkim-journey-12	2-Day Himalayan Ridge Retreat Retreat	NORTH-EAST INDIA & SIKKIM	1	2	29000	33350	Gangtok	Nathula	25 Feb 2027	27 Feb 2027	2	1	Premium SUV	["SIKKIM"]	["https://images.pexels.com/photos/33248529/pexels-photo-33248529.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/30156563/pexels-photo-30156563.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/33547415/pexels-photo-33547415.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of NORTH-EAST INDIA & SIKKIM. Experience luxury and impeccable service along every stop of this curated journey.	t	12	2026-04-23 12:33:49.381	2026-04-23 12:33:49.381
e39666c8-b998-4cd9-bdb9-da13d60bd80d	darjeeling-journey-13	4-Day Darjeeling Tea Trails Journey	EAST INDIA & BENGAL	3	4	37500	43125	Bagdogra	Kalimpong	27 Feb 2027	3 Mar 2027	4	1	Premium SUV	["DARJEELING"]	["https://images.pexels.com/photos/34087894/pexels-photo-34087894.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/31758870/pexels-photo-31758870.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/2408962/pexels-photo-2408962.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of EAST INDIA & BENGAL. Experience luxury and impeccable service along every stop of this curated journey.	t	13	2026-04-23 12:33:49.399	2026-04-23 12:33:49.399
e9fdfab0-58d1-45b5-900e-ef1b80785cb7	darjeeling-journey-14	5-Day Colonial Himalayan Escape Adventure	EAST INDIA & BENGAL	4	5	42000	48300	Darjeeling	Sandakphu	1 Mar 2027	6 Mar 2027	5	1	Premium SUV	["DARJEELING"]	["https://images.pexels.com/photos/15138292/pexels-photo-15138292.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/6741747/pexels-photo-6741747.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/33263644/pexels-photo-33263644.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of EAST INDIA & BENGAL. Experience luxury and impeccable service along every stop of this curated journey.	t	14	2026-04-23 12:33:49.415	2026-04-23 12:33:49.415
7c6b4e3e-c73d-4f5c-8bbe-45df3efbae05	kerala-journey-15	3-Day Kerala Backwaters & Hills Escape	SOUTH INDIA & KERALA	2	3	34500	39675	Cochin	Kumarakom	3 Mar 2027	6 Mar 2027	3	1	Premium SUV	["KERALA"]	["https://images.pexels.com/photos/30561587/pexels-photo-30561587.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/20035184/pexels-photo-20035184.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/17545322/pexels-photo-17545322.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of SOUTH INDIA & KERALA. Experience luxury and impeccable service along every stop of this curated journey.	t	15	2026-04-23 12:33:49.433	2026-04-23 12:33:49.433
c17aae7c-803f-4006-9093-8e1e60b56f17	kerala-journey-16	5-Day Munnar Tea Estate Retreat Expedition	SOUTH INDIA & KERALA	4	5	43000	49450	Cochin	Thekkady	2 Apr 2027	7 Apr 2027	5	1	Premium SUV	["KERALA"]	["https://images.pexels.com/photos/34713309/pexels-photo-34713309.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/20035184/pexels-photo-20035184.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/17545322/pexels-photo-17545322.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of SOUTH INDIA & KERALA. Experience luxury and impeccable service along every stop of this curated journey.	t	16	2026-04-23 12:33:49.45	2026-04-23 12:33:49.45
24ee0961-b72b-4a95-a870-11110c0d4821	goa-journey-17	3-Day Coastal Luxury Escape Retreat	WEST INDIA & GOA	2	3	35500	40825	Dabolim	Morjim	4 Apr 2027	7 Apr 2027	3	1	Premium SUV	["GOA"]	["https://images.pexels.com/photos/29236033/pexels-photo-29236033.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/32262471/pexels-photo-32262471.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/20717176/pexels-photo-20717176.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of WEST INDIA & GOA. Experience luxury and impeccable service along every stop of this curated journey.	t	17	2026-04-23 12:33:49.469	2026-04-23 12:33:49.469
dd602458-63f8-4886-85dd-1cb4eb28b660	goa-journey-18	3-Day Cataract & Cave Expedition Journey	WEST INDIA & GOA	2	3	36000	41400	Panjim	Tambdi Surla	6 Apr 2027	9 Apr 2027	3	1	Premium SUV	["GOA"]	["https://images.pexels.com/photos/29236033/pexels-photo-29236033.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/2432269/pexels-photo-2432269.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/11442148/pexels-photo-11442148.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of WEST INDIA & GOA. Experience luxury and impeccable service along every stop of this curated journey.	t	18	2026-04-23 12:33:49.486	2026-04-23 12:33:49.486
8243b5fa-831f-438b-b366-6801af2e4ab8	rajasthan-journey-19	4-Day Royal Rajasthan Odyssey Adventure	NORTH INDIA & RAJASTHAN	3	4	40500	46575	Jaipur	Jaisalmer	8 Apr 2027	12 Apr 2027	4	1	Premium SUV	["RAJASTHAN"]	["https://images.pexels.com/photos/33106473/pexels-photo-33106473.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/31739860/pexels-photo-31739860.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/31739859/pexels-photo-31739859.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of NORTH INDIA & RAJASTHAN. Experience luxury and impeccable service along every stop of this curated journey.	t	19	2026-04-23 12:33:49.505	2026-04-23 12:33:49.505
99036784-ea87-42d9-9ec0-a714566728be	rajasthan-journey-20	5-Day Golden Desert Splendour Escape	NORTH INDIA & RAJASTHAN	4	5	45000	51750	Jaisalmer	Jaipur	11 May 2027	16 May 2027	5	1	Premium SUV	["RAJASTHAN"]	["https://images.pexels.com/photos/31739859/pexels-photo-31739859.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/33726141/pexels-photo-33726141.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/29626935/pexels-photo-29626935.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of NORTH INDIA & RAJASTHAN. Experience luxury and impeccable service along every stop of this curated journey.	t	20	2026-04-23 12:33:49.524	2026-04-23 12:33:49.524
c2416a7c-0313-4b5e-951f-617473315d3f	rajasthan-journey-21	3-Day City of Lakes Luxury Expedition	NORTH INDIA & RAJASTHAN	2	3	37500	43125	Udaipur	Kumbhalgarh	13 May 2027	16 May 2027	3	1	Premium SUV	["RAJASTHAN"]	["https://images.pexels.com/photos/15534234/pexels-photo-15534234.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/12912712/pexels-photo-12912712.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/29626935/pexels-photo-29626935.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of NORTH INDIA & RAJASTHAN. Experience luxury and impeccable service along every stop of this curated journey.	t	21	2026-04-23 12:33:49.542	2026-04-23 12:33:49.542
2522cf66-d668-4373-bd5b-09b1b9c17c8e	sikkim-journey-0	2-Day Sikkim Explorer Escape	NORTH-EAST INDIA & SIKKIM	1	2	8000	11500	Gangtok	Lachung	1 Nov 2026	3 Nov 2026	2	1	Premium SUV	["SIKKIM"]	["https://images.pexels.com/photos/35431355/pexels-photo-35431355.jpeg?auto=compress&cs=tinysrgb&w=1600", "https://images.pexels.com/photos/33547415/pexels-photo-33547415.jpeg?auto=compress&cs=tinysrgb&w=1600"]	https://images.pexels.com/photos/30156563/pexels-photo-30156563.jpeg?auto=compress&cs=tinysrgb&w=1600	A majestic itinerary designed specifically around the distinct beauty of NORTH-EAST INDIA & SIKKIM. Experience luxury and impeccable service along every stop of this curated journey.	t	0	2026-04-23 12:33:49.157	2026-04-23 17:56:42.531
\.


--
-- TOC entry 3851 (class 2606 OID 16402)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3948 (class 2606 OID 16958)
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- TOC entry 3925 (class 2606 OID 16657)
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3936 (class 2606 OID 16885)
-- Name: b2b_agents b2b_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.b2b_agents
    ADD CONSTRAINT b2b_agents_pkey PRIMARY KEY (id);


--
-- TOC entry 3973 (class 2606 OID 17148)
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- TOC entry 4001 (class 2606 OID 17333)
-- Name: booking_services booking_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services
    ADD CONSTRAINT booking_services_pkey PRIMARY KEY (id);


--
-- TOC entry 3999 (class 2606 OID 17261)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- TOC entry 3933 (class 2606 OID 16870)
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- TOC entry 3963 (class 2606 OID 17092)
-- Name: cms_pages cms_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_pages
    ADD CONSTRAINT cms_pages_pkey PRIMARY KEY (id);


--
-- TOC entry 3958 (class 2606 OID 17016)
-- Name: day_itinerary_templates day_itinerary_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.day_itinerary_templates
    ADD CONSTRAINT day_itinerary_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 3978 (class 2606 OID 17159)
-- Name: destination_cms destination_cms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_cms
    ADD CONSTRAINT destination_cms_pkey PRIMARY KEY (id);


--
-- TOC entry 3891 (class 2606 OID 16536)
-- Name: destinations destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_pkey PRIMARY KEY (id);


--
-- TOC entry 3960 (class 2606 OID 17060)
-- Name: email_logs email_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3938 (class 2606 OID 16900)
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 3984 (class 2606 OID 17191)
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- TOC entry 3970 (class 2606 OID 17132)
-- Name: gallery_images gallery_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery_images
    ADD CONSTRAINT gallery_images_pkey PRIMARY KEY (id);


--
-- TOC entry 3966 (class 2606 OID 17105)
-- Name: home_banners home_banners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.home_banners
    ADD CONSTRAINT home_banners_pkey PRIMARY KEY (id);


--
-- TOC entry 3894 (class 2606 OID 16548)
-- Name: hotels hotels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotels
    ADD CONSTRAINT hotels_pkey PRIMARY KEY (id);


--
-- TOC entry 3928 (class 2606 OID 16670)
-- Name: integration_logs integration_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integration_logs
    ADD CONSTRAINT integration_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3988 (class 2606 OID 17214)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 4015 (class 2606 OID 25838)
-- Name: itineraries itineraries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itineraries
    ADD CONSTRAINT itineraries_pkey PRIMARY KEY (id);


--
-- TOC entry 4020 (class 2606 OID 25848)
-- Name: itinerary_days itinerary_days_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_days
    ADD CONSTRAINT itinerary_days_pkey PRIMARY KEY (id);


--
-- TOC entry 4023 (class 2606 OID 25861)
-- Name: itinerary_events itinerary_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_events
    ADD CONSTRAINT itinerary_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4027 (class 2606 OID 25873)
-- Name: itinerary_gallery_images itinerary_gallery_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_gallery_images
    ADD CONSTRAINT itinerary_gallery_images_pkey PRIMARY KEY (id);


--
-- TOC entry 3954 (class 2606 OID 16995)
-- Name: meal_plans meal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 3920 (class 2606 OID 16644)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3944 (class 2606 OID 16933)
-- Name: org_settings org_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_settings
    ADD CONSTRAINT org_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3980 (class 2606 OID 17176)
-- Name: package_terms package_terms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.package_terms
    ADD CONSTRAINT package_terms_pkey PRIMARY KEY (id);


--
-- TOC entry 3956 (class 2606 OID 17006)
-- Name: package_themes package_themes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.package_themes
    ADD CONSTRAINT package_themes_pkey PRIMARY KEY (id);


--
-- TOC entry 3914 (class 2606 OID 16625)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 3857 (class 2606 OID 16427)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3900 (class 2606 OID 16575)
-- Name: proposal_days proposal_days_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_days
    ADD CONSTRAINT proposal_days_pkey PRIMARY KEY (id);


--
-- TOC entry 3897 (class 2606 OID 16565)
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- TOC entry 3882 (class 2606 OID 16512)
-- Name: queries queries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_pkey PRIMARY KEY (id);


--
-- TOC entry 4009 (class 2606 OID 17365)
-- Name: query_documents query_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_documents
    ADD CONSTRAINT query_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 3887 (class 2606 OID 16525)
-- Name: query_notes query_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_notes
    ADD CONSTRAINT query_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 3941 (class 2606 OID 16922)
-- Name: query_status_settings query_status_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_status_settings
    ADD CONSTRAINT query_status_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3859 (class 2606 OID 16439)
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3854 (class 2606 OID 16416)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3952 (class 2606 OID 16982)
-- Name: room_types room_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_types
    ADD CONSTRAINT room_types_pkey PRIMARY KEY (id);


--
-- TOC entry 3996 (class 2606 OID 17250)
-- Name: sheet_sync_configs sheet_sync_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sheet_sync_configs
    ADD CONSTRAINT sheet_sync_configs_pkey PRIMARY KEY (id);


--
-- TOC entry 3946 (class 2606 OID 16945)
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- TOC entry 3968 (class 2606 OID 17119)
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- TOC entry 3909 (class 2606 OID 16608)
-- Name: tour_cancellations tour_cancellations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_cancellations
    ADD CONSTRAINT tour_cancellations_pkey PRIMARY KEY (id);


--
-- TOC entry 3904 (class 2606 OID 16592)
-- Name: tours tours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_pkey PRIMARY KEY (id);


--
-- TOC entry 3950 (class 2606 OID 16971)
-- Name: transfers transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_pkey PRIMARY KEY (id);


--
-- TOC entry 4038 (class 2606 OID 41609)
-- Name: trending_destinations trending_destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trending_destinations
    ADD CONSTRAINT trending_destinations_pkey PRIMARY KEY (id);


--
-- TOC entry 3862 (class 2606 OID 16453)
-- Name: user_permission_overrides user_permission_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permission_overrides
    ADD CONSTRAINT user_permission_overrides_pkey PRIMARY KEY (id);


--
-- TOC entry 3872 (class 2606 OID 16489)
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3868 (class 2606 OID 16476)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3992 (class 2606 OID 17229)
-- Name: vendor_payments vendor_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4005 (class 2606 OID 17349)
-- Name: vouchers vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);


--
-- TOC entry 4035 (class 2606 OID 41591)
-- Name: website_journey_days website_journey_days_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.website_journey_days
    ADD CONSTRAINT website_journey_days_pkey PRIMARY KEY (id);


--
-- TOC entry 4030 (class 2606 OID 41578)
-- Name: website_journeys website_journeys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.website_journeys
    ADD CONSTRAINT website_journeys_pkey PRIMARY KEY (id);


--
-- TOC entry 3922 (class 1259 OID 16710)
-- Name: activity_logs_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_logs_created_at_idx ON public.activity_logs USING btree (created_at);


--
-- TOC entry 3923 (class 1259 OID 16709)
-- Name: activity_logs_entity_type_entity_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_logs_entity_type_entity_id_idx ON public.activity_logs USING btree (entity_type, entity_id);


--
-- TOC entry 3926 (class 1259 OID 16708)
-- Name: activity_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_logs_user_id_idx ON public.activity_logs USING btree (user_id);


--
-- TOC entry 3934 (class 1259 OID 17018)
-- Name: b2b_agents_mobile_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX b2b_agents_mobile_key ON public.b2b_agents USING btree (mobile);


--
-- TOC entry 3971 (class 1259 OID 17264)
-- Name: blog_posts_is_published_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX blog_posts_is_published_idx ON public.blog_posts USING btree (is_published);


--
-- TOC entry 3974 (class 1259 OID 17265)
-- Name: blog_posts_published_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX blog_posts_published_at_idx ON public.blog_posts USING btree (published_at);


--
-- TOC entry 3975 (class 1259 OID 17263)
-- Name: blog_posts_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blog_posts_slug_key ON public.blog_posts USING btree (slug);


--
-- TOC entry 4002 (class 1259 OID 17366)
-- Name: booking_services_query_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX booking_services_query_id_idx ON public.booking_services USING btree (query_id);


--
-- TOC entry 4003 (class 1259 OID 17367)
-- Name: booking_services_service_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX booking_services_service_type_idx ON public.booking_services USING btree (service_type);


--
-- TOC entry 3997 (class 1259 OID 17274)
-- Name: branches_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX branches_name_key ON public.branches USING btree (name);


--
-- TOC entry 3931 (class 1259 OID 17017)
-- Name: clients_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX clients_phone_key ON public.clients USING btree (phone);


--
-- TOC entry 3964 (class 1259 OID 17262)
-- Name: cms_pages_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cms_pages_slug_key ON public.cms_pages USING btree (slug);


--
-- TOC entry 3976 (class 1259 OID 17266)
-- Name: destination_cms_destination_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX destination_cms_destination_id_key ON public.destination_cms USING btree (destination_id);


--
-- TOC entry 3961 (class 1259 OID 17061)
-- Name: email_logs_query_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX email_logs_query_id_idx ON public.email_logs USING btree (query_id);


--
-- TOC entry 3981 (class 1259 OID 17267)
-- Name: expenses_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX expenses_category_idx ON public.expenses USING btree (category);


--
-- TOC entry 3982 (class 1259 OID 17268)
-- Name: expenses_expense_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX expenses_expense_date_idx ON public.expenses USING btree (expense_date);


--
-- TOC entry 3892 (class 1259 OID 16693)
-- Name: hotels_destination_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hotels_destination_id_idx ON public.hotels USING btree (destination_id);


--
-- TOC entry 3929 (class 1259 OID 16712)
-- Name: integration_logs_related_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX integration_logs_related_id_idx ON public.integration_logs USING btree (related_id);


--
-- TOC entry 3930 (class 1259 OID 16711)
-- Name: integration_logs_type_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX integration_logs_type_status_idx ON public.integration_logs USING btree (type, status);


--
-- TOC entry 3985 (class 1259 OID 17271)
-- Name: invoices_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_created_at_idx ON public.invoices USING btree (created_at);


--
-- TOC entry 3986 (class 1259 OID 17269)
-- Name: invoices_invoice_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX invoices_invoice_number_key ON public.invoices USING btree (invoice_number);


--
-- TOC entry 3989 (class 1259 OID 17270)
-- Name: invoices_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);


--
-- TOC entry 4011 (class 1259 OID 25877)
-- Name: itineraries_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX itineraries_created_at_idx ON public.itineraries USING btree (created_at);


--
-- TOC entry 4012 (class 1259 OID 25875)
-- Name: itineraries_created_by_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX itineraries_created_by_idx ON public.itineraries USING btree (created_by);


--
-- TOC entry 4013 (class 1259 OID 32777)
-- Name: itineraries_is_template_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX itineraries_is_template_idx ON public.itineraries USING btree (is_template);


--
-- TOC entry 4016 (class 1259 OID 25874)
-- Name: itineraries_share_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX itineraries_share_slug_key ON public.itineraries USING btree (share_slug);


--
-- TOC entry 4017 (class 1259 OID 25876)
-- Name: itineraries_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX itineraries_status_idx ON public.itineraries USING btree (status);


--
-- TOC entry 4018 (class 1259 OID 25878)
-- Name: itinerary_days_itinerary_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX itinerary_days_itinerary_id_idx ON public.itinerary_days USING btree (itinerary_id);


--
-- TOC entry 4021 (class 1259 OID 25879)
-- Name: itinerary_events_day_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX itinerary_events_day_id_idx ON public.itinerary_events USING btree (day_id);


--
-- TOC entry 4024 (class 1259 OID 25880)
-- Name: itinerary_events_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX itinerary_events_type_idx ON public.itinerary_events USING btree (type);


--
-- TOC entry 4025 (class 1259 OID 25881)
-- Name: itinerary_gallery_images_itinerary_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX itinerary_gallery_images_itinerary_id_idx ON public.itinerary_gallery_images USING btree (itinerary_id);


--
-- TOC entry 3918 (class 1259 OID 16707)
-- Name: notifications_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_created_at_idx ON public.notifications USING btree (created_at);


--
-- TOC entry 3921 (class 1259 OID 16706)
-- Name: notifications_user_id_is_read_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_user_id_is_read_idx ON public.notifications USING btree (user_id, is_read);


--
-- TOC entry 3942 (class 1259 OID 17020)
-- Name: org_settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX org_settings_key_key ON public.org_settings USING btree (key);


--
-- TOC entry 3911 (class 1259 OID 16701)
-- Name: payments_idempotency_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payments_idempotency_key_key ON public.payments USING btree (idempotency_key);


--
-- TOC entry 3912 (class 1259 OID 16705)
-- Name: payments_payment_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_payment_date_idx ON public.payments USING btree (payment_date);


--
-- TOC entry 3915 (class 1259 OID 16703)
-- Name: payments_query_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_query_id_idx ON public.payments USING btree (query_id);


--
-- TOC entry 3916 (class 1259 OID 16704)
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- TOC entry 3917 (class 1259 OID 16702)
-- Name: payments_tour_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_tour_id_idx ON public.payments USING btree (tour_id);


--
-- TOC entry 3855 (class 1259 OID 16672)
-- Name: permissions_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_key_key ON public.permissions USING btree (key);


--
-- TOC entry 3901 (class 1259 OID 16695)
-- Name: proposal_days_proposal_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX proposal_days_proposal_id_idx ON public.proposal_days USING btree (proposal_id);


--
-- TOC entry 3895 (class 1259 OID 25882)
-- Name: proposals_itinerary_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX proposals_itinerary_id_idx ON public.proposals USING btree (itinerary_id);


--
-- TOC entry 3898 (class 1259 OID 16694)
-- Name: proposals_query_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX proposals_query_id_idx ON public.proposals USING btree (query_id);


--
-- TOC entry 3874 (class 1259 OID 16683)
-- Name: queries_assigned_to_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX queries_assigned_to_idx ON public.queries USING btree (assigned_to);


--
-- TOC entry 3875 (class 1259 OID 16688)
-- Name: queries_assigned_to_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX queries_assigned_to_status_idx ON public.queries USING btree (assigned_to, status);


--
-- TOC entry 3876 (class 1259 OID 16687)
-- Name: queries_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX queries_created_at_idx ON public.queries USING btree (created_at);


--
-- TOC entry 3877 (class 1259 OID 16689)
-- Name: queries_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX queries_deleted_at_idx ON public.queries USING btree (deleted_at);


--
-- TOC entry 3878 (class 1259 OID 16686)
-- Name: queries_lead_source_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX queries_lead_source_idx ON public.queries USING btree (lead_source);


--
-- TOC entry 3879 (class 1259 OID 16685)
-- Name: queries_next_followup_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX queries_next_followup_at_idx ON public.queries USING btree (next_followup_at);


--
-- TOC entry 3880 (class 1259 OID 16682)
-- Name: queries_phone_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX queries_phone_idx ON public.queries USING btree (phone);


--
-- TOC entry 3883 (class 1259 OID 16681)
-- Name: queries_query_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX queries_query_code_key ON public.queries USING btree (query_code);


--
-- TOC entry 3884 (class 1259 OID 16684)
-- Name: queries_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX queries_status_idx ON public.queries USING btree (status);


--
-- TOC entry 4010 (class 1259 OID 17370)
-- Name: query_documents_query_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX query_documents_query_id_idx ON public.query_documents USING btree (query_id);


--
-- TOC entry 3885 (class 1259 OID 16692)
-- Name: query_notes_follow_up_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX query_notes_follow_up_at_idx ON public.query_notes USING btree (follow_up_at);


--
-- TOC entry 3888 (class 1259 OID 16690)
-- Name: query_notes_query_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX query_notes_query_id_idx ON public.query_notes USING btree (query_id);


--
-- TOC entry 3889 (class 1259 OID 16691)
-- Name: query_notes_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX query_notes_user_id_idx ON public.query_notes USING btree (user_id);


--
-- TOC entry 3939 (class 1259 OID 17019)
-- Name: query_status_settings_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX query_status_settings_code_key ON public.query_status_settings USING btree (code);


--
-- TOC entry 3860 (class 1259 OID 16673)
-- Name: role_permissions_role_id_permission_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX role_permissions_role_id_permission_id_key ON public.role_permissions USING btree (role_id, permission_id);


--
-- TOC entry 3852 (class 1259 OID 16671)
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- TOC entry 3910 (class 1259 OID 16700)
-- Name: tour_cancellations_tour_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tour_cancellations_tour_id_key ON public.tour_cancellations USING btree (tour_id);


--
-- TOC entry 3902 (class 1259 OID 16699)
-- Name: tours_assigned_ops_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tours_assigned_ops_idx ON public.tours USING btree (assigned_ops);


--
-- TOC entry 3905 (class 1259 OID 16698)
-- Name: tours_start_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tours_start_date_idx ON public.tours USING btree (start_date);


--
-- TOC entry 3906 (class 1259 OID 16697)
-- Name: tours_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tours_status_idx ON public.tours USING btree (status);


--
-- TOC entry 3907 (class 1259 OID 16696)
-- Name: tours_tour_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tours_tour_code_key ON public.tours USING btree (tour_code);


--
-- TOC entry 4036 (class 1259 OID 41614)
-- Name: trending_destinations_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX trending_destinations_is_active_idx ON public.trending_destinations USING btree (is_active);


--
-- TOC entry 3863 (class 1259 OID 16674)
-- Name: user_permission_overrides_user_id_permission_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_permission_overrides_user_id_permission_id_key ON public.user_permission_overrides USING btree (user_id, permission_id);


--
-- TOC entry 3870 (class 1259 OID 16680)
-- Name: user_sessions_expires_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_sessions_expires_at_idx ON public.user_sessions USING btree (expires_at);


--
-- TOC entry 3873 (class 1259 OID 16679)
-- Name: user_sessions_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_sessions_user_id_idx ON public.user_sessions USING btree (user_id);


--
-- TOC entry 3864 (class 1259 OID 16675)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 3865 (class 1259 OID 16677)
-- Name: users_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_is_active_idx ON public.users USING btree (is_active);


--
-- TOC entry 3866 (class 1259 OID 16678)
-- Name: users_last_assigned_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_last_assigned_at_idx ON public.users USING btree (last_assigned_at);


--
-- TOC entry 3869 (class 1259 OID 16676)
-- Name: users_role_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_id_idx ON public.users USING btree (role_id);


--
-- TOC entry 3990 (class 1259 OID 17272)
-- Name: vendor_payments_payment_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vendor_payments_payment_date_idx ON public.vendor_payments USING btree (payment_date);


--
-- TOC entry 3993 (class 1259 OID 25358)
-- Name: vendor_payments_query_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vendor_payments_query_id_idx ON public.vendor_payments USING btree (query_id);


--
-- TOC entry 3994 (class 1259 OID 17273)
-- Name: vendor_payments_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vendor_payments_supplier_id_idx ON public.vendor_payments USING btree (supplier_id);


--
-- TOC entry 4006 (class 1259 OID 17369)
-- Name: vouchers_query_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX vouchers_query_id_idx ON public.vouchers USING btree (query_id);


--
-- TOC entry 4007 (class 1259 OID 17368)
-- Name: vouchers_voucher_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX vouchers_voucher_number_key ON public.vouchers USING btree (voucher_number);


--
-- TOC entry 4033 (class 1259 OID 41613)
-- Name: website_journey_days_journey_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX website_journey_days_journey_id_idx ON public.website_journey_days USING btree (journey_id);


--
-- TOC entry 4028 (class 1259 OID 41611)
-- Name: website_journeys_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX website_journeys_is_active_idx ON public.website_journeys USING btree (is_active);


--
-- TOC entry 4031 (class 1259 OID 41612)
-- Name: website_journeys_sequence_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX website_journeys_sequence_idx ON public.website_journeys USING btree (sequence);


--
-- TOC entry 4032 (class 1259 OID 41610)
-- Name: website_journeys_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX website_journeys_slug_key ON public.website_journeys USING btree (slug);


--
-- TOC entry 4071 (class 2606 OID 17031)
-- Name: activities activities_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4070 (class 2606 OID 17427)
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4082 (class 2606 OID 17386)
-- Name: booking_services booking_services_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services
    ADD CONSTRAINT booking_services_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4083 (class 2606 OID 17376)
-- Name: booking_services booking_services_proposal_day_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services
    ADD CONSTRAINT booking_services_proposal_day_id_fkey FOREIGN KEY (proposal_day_id) REFERENCES public.proposal_days(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4084 (class 2606 OID 17371)
-- Name: booking_services booking_services_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services
    ADD CONSTRAINT booking_services_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.queries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4085 (class 2606 OID 17381)
-- Name: booking_services booking_services_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_services
    ADD CONSTRAINT booking_services_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4073 (class 2606 OID 17041)
-- Name: day_itinerary_templates day_itinerary_templates_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.day_itinerary_templates
    ADD CONSTRAINT day_itinerary_templates_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4077 (class 2606 OID 17280)
-- Name: destination_cms destination_cms_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_cms
    ADD CONSTRAINT destination_cms_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4074 (class 2606 OID 17062)
-- Name: email_logs email_logs_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.queries(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4075 (class 2606 OID 17072)
-- Name: email_logs email_logs_sent_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4076 (class 2606 OID 17067)
-- Name: email_logs email_logs_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.email_templates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4078 (class 2606 OID 17285)
-- Name: expenses expenses_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4053 (class 2606 OID 16768)
-- Name: hotels hotels_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hotels
    ADD CONSTRAINT hotels_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4079 (class 2606 OID 17290)
-- Name: invoices invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4091 (class 2606 OID 25888)
-- Name: itineraries itineraries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itineraries
    ADD CONSTRAINT itineraries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4092 (class 2606 OID 25898)
-- Name: itinerary_days itinerary_days_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_days
    ADD CONSTRAINT itinerary_days_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4093 (class 2606 OID 25893)
-- Name: itinerary_days itinerary_days_itinerary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_days
    ADD CONSTRAINT itinerary_days_itinerary_id_fkey FOREIGN KEY (itinerary_id) REFERENCES public.itineraries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4094 (class 2606 OID 25903)
-- Name: itinerary_events itinerary_events_day_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_events
    ADD CONSTRAINT itinerary_events_day_id_fkey FOREIGN KEY (day_id) REFERENCES public.itinerary_days(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4095 (class 2606 OID 25908)
-- Name: itinerary_gallery_images itinerary_gallery_images_itinerary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itinerary_gallery_images
    ADD CONSTRAINT itinerary_gallery_images_itinerary_id_fkey FOREIGN KEY (itinerary_id) REFERENCES public.itineraries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4069 (class 2606 OID 16843)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4066 (class 2606 OID 16833)
-- Name: payments payments_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.queries(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4067 (class 2606 OID 17422)
-- Name: payments payments_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4068 (class 2606 OID 16828)
-- Name: payments payments_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4057 (class 2606 OID 16788)
-- Name: proposal_days proposal_days_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_days
    ADD CONSTRAINT proposal_days_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4058 (class 2606 OID 16793)
-- Name: proposal_days proposal_days_hotel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_days
    ADD CONSTRAINT proposal_days_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4059 (class 2606 OID 16783)
-- Name: proposal_days proposal_days_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_days
    ADD CONSTRAINT proposal_days_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4054 (class 2606 OID 16778)
-- Name: proposals proposals_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4055 (class 2606 OID 41464)
-- Name: proposals proposals_itinerary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_itinerary_id_fkey FOREIGN KEY (itinerary_id) REFERENCES public.itineraries(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4056 (class 2606 OID 16773)
-- Name: proposals proposals_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.queries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4048 (class 2606 OID 16753)
-- Name: queries queries_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4049 (class 2606 OID 17026)
-- Name: queries queries_b2b_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_b2b_agent_id_fkey FOREIGN KEY (b2b_agent_id) REFERENCES public.b2b_agents(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4050 (class 2606 OID 17021)
-- Name: queries queries_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queries
    ADD CONSTRAINT queries_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4089 (class 2606 OID 17406)
-- Name: query_documents query_documents_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_documents
    ADD CONSTRAINT query_documents_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.queries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4090 (class 2606 OID 17411)
-- Name: query_documents query_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_documents
    ADD CONSTRAINT query_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4051 (class 2606 OID 16758)
-- Name: query_notes query_notes_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_notes
    ADD CONSTRAINT query_notes_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.queries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4052 (class 2606 OID 16763)
-- Name: query_notes query_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_notes
    ADD CONSTRAINT query_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4039 (class 2606 OID 16718)
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4040 (class 2606 OID 16713)
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4063 (class 2606 OID 16823)
-- Name: tour_cancellations tour_cancellations_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_cancellations
    ADD CONSTRAINT tour_cancellations_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4064 (class 2606 OID 16818)
-- Name: tour_cancellations tour_cancellations_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_cancellations
    ADD CONSTRAINT tour_cancellations_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4065 (class 2606 OID 16813)
-- Name: tour_cancellations tour_cancellations_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_cancellations
    ADD CONSTRAINT tour_cancellations_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4060 (class 2606 OID 16808)
-- Name: tours tours_assigned_ops_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_assigned_ops_fkey FOREIGN KEY (assigned_ops) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4061 (class 2606 OID 16803)
-- Name: tours tours_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4062 (class 2606 OID 16798)
-- Name: tours tours_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.queries(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4072 (class 2606 OID 17036)
-- Name: transfers transfers_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4041 (class 2606 OID 16728)
-- Name: user_permission_overrides user_permission_overrides_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permission_overrides
    ADD CONSTRAINT user_permission_overrides_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4042 (class 2606 OID 16733)
-- Name: user_permission_overrides user_permission_overrides_set_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permission_overrides
    ADD CONSTRAINT user_permission_overrides_set_by_fkey FOREIGN KEY (set_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4043 (class 2606 OID 16723)
-- Name: user_permission_overrides user_permission_overrides_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permission_overrides
    ADD CONSTRAINT user_permission_overrides_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4047 (class 2606 OID 16748)
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4044 (class 2606 OID 17275)
-- Name: users users_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4045 (class 2606 OID 16743)
-- Name: users users_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4046 (class 2606 OID 16738)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4080 (class 2606 OID 25359)
-- Name: vendor_payments vendor_payments_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.queries(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4081 (class 2606 OID 17295)
-- Name: vendor_payments vendor_payments_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_payments
    ADD CONSTRAINT vendor_payments_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4086 (class 2606 OID 17396)
-- Name: vouchers vouchers_booking_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_booking_service_id_fkey FOREIGN KEY (booking_service_id) REFERENCES public.booking_services(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4087 (class 2606 OID 17401)
-- Name: vouchers vouchers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4088 (class 2606 OID 17391)
-- Name: vouchers vouchers_query_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_query_id_fkey FOREIGN KEY (query_id) REFERENCES public.queries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4096 (class 2606 OID 41615)
-- Name: website_journey_days website_journey_days_journey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.website_journey_days
    ADD CONSTRAINT website_journey_days_journey_id_fkey FOREIGN KEY (journey_id) REFERENCES public.website_journeys(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-06-03 16:18:21 IST

--
-- PostgreSQL database dump complete
--

\unrestrict ClP4d3ZhuWOv62LkANhW9rWRHQ38xEsDY1P8pI1UtexXbWVXz3aiREbmyhcWNLt

