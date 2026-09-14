--
-- PostgreSQL database dump
--

\restrict wKoYM9Lay2k2jQZ9AzDt505xyPZPKBBVrgZn9OYQHXTBwznJFw09c1IWYfCSJkt

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    equipment_id integer NOT NULL,
    farmer_id integer NOT NULL,
    slot_id integer,
    booking_date date NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    total_amount numeric(10,2) DEFAULT 0,
    status character varying(20) DEFAULT 'pending'::character varying,
    farmer_notes text,
    provider_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_booking_status CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    id integer NOT NULL,
    provider_id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    category character varying(100) NOT NULL,
    brand character varying(100),
    model character varying(100),
    price_per_day numeric(10,2) NOT NULL,
    location character varying(150),
    latitude numeric(10,7),
    longitude numeric(10,7),
    image_url text,
    status character varying(20) DEFAULT 'available'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_equipment_price CHECK ((price_per_day >= (0)::numeric)),
    CONSTRAINT valid_equipment_status CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'unavailable'::character varying, 'maintenance'::character varying])::text[])))
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    booking_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    transaction_id character varying(100),
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT valid_payment_method CHECK (((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'upi'::character varying, 'card'::character varying, 'bank_transfer'::character varying])::text[]))),
    CONSTRAINT valid_payment_status CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(15),
    role character varying(20) DEFAULT 'farmer'::character varying,
    location character varying(150),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: admin_dashboard_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.admin_dashboard_summary AS
 SELECT ( SELECT count(*) AS count
           FROM public.users) AS total_users,
    ( SELECT count(*) AS count
           FROM public.users
          WHERE ((users.role)::text = 'farmer'::text)) AS total_farmers,
    ( SELECT count(*) AS count
           FROM public.users
          WHERE ((users.role)::text = 'provider'::text)) AS total_providers,
    ( SELECT count(*) AS count
           FROM public.equipment) AS total_equipment,
    ( SELECT count(*) AS count
           FROM public.bookings) AS total_bookings,
    ( SELECT count(*) AS count
           FROM public.bookings
          WHERE ((bookings.status)::text = 'pending'::text)) AS pending_bookings,
    ( SELECT count(*) AS count
           FROM public.bookings
          WHERE ((bookings.status)::text = 'confirmed'::text)) AS confirmed_bookings,
    ( SELECT COALESCE(sum(payments.amount), (0)::numeric) AS "coalesce"
           FROM public.payments
          WHERE ((payments.status)::text = 'paid'::text)) AS total_revenue;


ALTER VIEW public.admin_dashboard_summary OWNER TO postgres;

--
-- Name: equipment_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_slots (
    id integer NOT NULL,
    equipment_id integer NOT NULL,
    slot_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_slot_time CHECK ((end_time > start_time))
);


ALTER TABLE public.equipment_slots OWNER TO postgres;

--
-- Name: available_equipment_slots; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.available_equipment_slots AS
 SELECT e.id AS equipment_id,
    e.name AS equipment_name,
    e.category,
    e.brand,
    e.model,
    e.price_per_day,
    e.location,
    es.id AS slot_id,
    es.slot_date,
    es.start_time,
    es.end_time
   FROM (public.equipment e
     JOIN public.equipment_slots es ON ((e.id = es.equipment_id)))
  WHERE (((e.status)::text = 'available'::text) AND (es.is_available = true));


ALTER VIEW public.available_equipment_slots OWNER TO postgres;

--
-- Name: booking_history; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.booking_history AS
 SELECT b.id AS booking_id,
    b.farmer_id,
    farmer.name AS farmer_name,
    farmer.email AS farmer_email,
    e.provider_id,
    provider.name AS provider_name,
    b.equipment_id,
    e.name AS equipment_name,
    e.category,
    e.location AS equipment_location,
    b.slot_id,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.total_amount,
    b.status,
    b.farmer_notes,
    b.provider_notes,
    b.created_at,
    b.updated_at
   FROM (((public.bookings b
     JOIN public.users farmer ON ((b.farmer_id = farmer.id)))
     JOIN public.equipment e ON ((b.equipment_id = e.id)))
     JOIN public.users provider ON ((e.provider_id = provider.id)));


ALTER VIEW public.booking_history OWNER TO postgres;

--
-- Name: booking_report; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.booking_report AS
 SELECT b.id AS booking_id,
    farmer.name AS farmer_name,
    farmer.email AS farmer_email,
    farmer.phone AS farmer_phone,
    provider.name AS provider_name,
    provider.email AS provider_email,
    e.name AS equipment_name,
    e.category,
    e.brand,
    e.model,
    e.location AS equipment_location,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.total_amount AS booking_amount,
    b.status AS booking_status,
    p.amount AS paid_amount,
    p.payment_method,
    p.transaction_id,
    p.status AS payment_status,
    p.payment_date,
    b.created_at AS booking_created_at,
    b.updated_at AS booking_updated_at
   FROM ((((public.bookings b
     JOIN public.users farmer ON ((b.farmer_id = farmer.id)))
     JOIN public.equipment e ON ((b.equipment_id = e.id)))
     JOIN public.users provider ON ((e.provider_id = provider.id)))
     LEFT JOIN public.payments p ON ((b.id = p.booking_id)));


ALTER VIEW public.booking_report OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: demand_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demand_history (
    id integer NOT NULL,
    equipment_id integer,
    category character varying(100),
    location character varying(150),
    booking_date date NOT NULL,
    demand_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_demand_count CHECK ((demand_count >= 0))
);


ALTER TABLE public.demand_history OWNER TO postgres;

--
-- Name: demand_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demand_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demand_history_id_seq OWNER TO postgres;

--
-- Name: demand_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demand_history_id_seq OWNED BY public.demand_history.id;


--
-- Name: equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_id_seq OWNER TO postgres;

--
-- Name: equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_id_seq OWNED BY public.equipment.id;


--
-- Name: equipment_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_slots_id_seq OWNER TO postgres;

--
-- Name: equipment_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_slots_id_seq OWNED BY public.equipment_slots.id;


--
-- Name: farmer_booking_history; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.farmer_booking_history AS
 SELECT b.id AS booking_id,
    b.farmer_id,
    farmer.name AS farmer_name,
    e.name AS equipment_name,
    e.category,
    e.location AS equipment_location,
    e.provider_id,
    provider.name AS provider_name,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.total_amount,
    b.status,
    b.farmer_notes,
    b.provider_notes,
    b.created_at
   FROM (((public.bookings b
     JOIN public.users farmer ON ((b.farmer_id = farmer.id)))
     JOIN public.equipment e ON ((b.equipment_id = e.id)))
     JOIN public.users provider ON ((e.provider_id = provider.id)));


ALTER VIEW public.farmer_booking_history OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: provider_booking_requests; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.provider_booking_requests AS
 SELECT b.id AS booking_id,
    e.provider_id,
    provider.name AS provider_name,
    farmer.name AS farmer_name,
    farmer.email AS farmer_email,
    e.name AS equipment_name,
    e.category,
    e.location AS equipment_location,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.total_amount,
    b.status,
    b.farmer_notes,
    b.provider_notes,
    b.created_at,
    b.updated_at
   FROM (((public.bookings b
     JOIN public.users farmer ON ((b.farmer_id = farmer.id)))
     JOIN public.equipment e ON ((b.equipment_id = e.id)))
     JOIN public.users provider ON ((e.provider_id = provider.id)));


ALTER VIEW public.provider_booking_requests OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: demand_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_history ALTER COLUMN id SET DEFAULT nextval('public.demand_history_id_seq'::regclass);


--
-- Name: equipment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment ALTER COLUMN id SET DEFAULT nextval('public.equipment_id_seq'::regclass);


--
-- Name: equipment_slots id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_slots ALTER COLUMN id SET DEFAULT nextval('public.equipment_slots_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: demand_history demand_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_history
    ADD CONSTRAINT demand_history_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- Name: equipment_slots equipment_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_slots
    ADD CONSTRAINT equipment_slots_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_transaction_id_key UNIQUE (transaction_id);


--
-- Name: equipment_slots unique_equipment_slot; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_slots
    ADD CONSTRAINT unique_equipment_slot UNIQUE (equipment_id, slot_date, start_time, end_time);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_bookings_booking_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_booking_date ON public.bookings USING btree (booking_date);


--
-- Name: idx_bookings_equipment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_equipment_id ON public.bookings USING btree (equipment_id);


--
-- Name: idx_bookings_farmer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_farmer_id ON public.bookings USING btree (farmer_id);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_equipment_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_equipment_provider_id ON public.equipment USING btree (provider_id);


--
-- Name: idx_equipment_slots_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_equipment_slots_date ON public.equipment_slots USING btree (slot_date);


--
-- Name: idx_equipment_slots_equipment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_equipment_slots_equipment_id ON public.equipment_slots USING btree (equipment_id);


--
-- Name: idx_equipment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_equipment_status ON public.equipment USING btree (status);


--
-- Name: idx_payments_booking_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_booking_id ON public.payments USING btree (booking_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: bookings fk_booking_equipment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_booking_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: bookings fk_booking_farmer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_booking_farmer FOREIGN KEY (farmer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bookings fk_booking_slot; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT fk_booking_slot FOREIGN KEY (slot_id) REFERENCES public.equipment_slots(id) ON DELETE SET NULL;


--
-- Name: demand_history fk_demand_equipment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demand_history
    ADD CONSTRAINT fk_demand_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE SET NULL;


--
-- Name: equipment fk_equipment_provider; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT fk_equipment_provider FOREIGN KEY (provider_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments fk_payment_booking; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: equipment_slots fk_slot_equipment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_slots
    ADD CONSTRAINT fk_slot_equipment FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict wKoYM9Lay2k2jQZ9AzDt505xyPZPKBBVrgZn9OYQHXTBwznJFw09c1IWYfCSJkt

