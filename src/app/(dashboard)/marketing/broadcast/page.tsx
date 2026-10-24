'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';
import {
  Megaphone,
  Users,
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  FileText,
  Upload,
  Trash2,
  AlertTriangle,
  Gift,
  Flame,
  ArrowRight,
  ShieldCheck,
  Info,
  DollarSign,
  Layers,
  ChevronRight,
  ExternalLink,
  Tag,
  Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RecipientItem {
  queryId: string;
  queryCode: string;
  name: string;
  phone: string | null;
  email: string | null;
  destination: string | null;
  status: string;
  leadSource: string;
  travelDate: string | null;
  createdAt: string;
  hasPhone: boolean;
  hasEmail: boolean;
}

interface CampaignHistoryItem {
  id: string;
  name: string;
  segment: string;
  channel: string;
  templateName: string | null;
  emailSubject: string | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: string;
  launchedAt: string | null;
  createdAt: string;
  creator?: { id: string; name: string } | null;
}

const TEMPLATE_PRESETS = [
  {
    id: 'diwali_festive_poster',
    name: '🪔 Diwali / Festive Grand Offer',
    description: 'Bespoke Festive Retreats across Sikkim, Darjeeling, Kerala & Andaman (Flat ₹3,000 OFF)',
    category: 'MARKETING',
    defaultOffer: 'Diwali Special Offer: Flat ₹3,000 OFF on All Packages (Code: DIWALI2026) across Gangtok, Darjeeling, Kerala & Andaman!',
    promoCode: 'DIWALI2026',
    emailSubject: '🪔 Exclusive Diwali Privilege: Flat ₹3,000 OFF on Luxury India Vacations | Imagica Holidays',
    emailContent: `<div style="background-color: #f5f4f0; padding: 44px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 16px 45px rgba(0,0,0,0.04); border: 1px solid #e7e2d8; margin: 0 auto;">
    
    <!-- MINIMALIST HEADER: JUST THE PURE LOGO WITH BREATHING ROOM -->
    <tr>
      <td style="background-color: #ffffff; padding: 46px 24px 28px; text-align: center;">
        <a href="https://imagicaholidays.com" target="_blank" style="text-decoration: none; display: inline-block;">
          <img src="https://media.imagicaholidays.com/campaigns/imagica-crm-logo-dark-trans.png" alt="Imagica Holidays" height="38" style="height: 38px; max-height: 38px; width: auto; margin: 0 auto; display: block; border: 0;" />
        </a>
        <div style="width: 32px; height: 1px; background-color: #c5a059; margin: 18px auto 0;"></div>
      </td>
    </tr>

    <!-- EDITORIAL GREETING -->
    <tr>
      <td style="padding: 14px 44px 22px; text-align: center; background-color: #ffffff;">
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; font-size: 8.5px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; color: #8c733e; margin-bottom: 14px;">
          ✦ &nbsp; FESTIVE INVITATION &nbsp; ✦
        </div>
        
        <h1 style="margin: 0 0 16px; font-family: 'Didot', 'Bodoni MT', 'Playfair Display', Georgia, serif; font-size: 29px; font-weight: 400; line-height: 1.3; color: #0f172a; letter-spacing: 0.5px;">
          Dear {{name}},
        </h1>

        <p style="margin: 0 auto 20px; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; font-size: 14.5px; line-height: 1.85; color: #475569; max-width: 480px;">
          Diwali is a celebration of luminous beginnings, joyful gatherings, and cherished journeys. On behalf of <strong>Imagica Holidays, Kolkata</strong>, we warmly invite you to explore our bespoke festive holiday collection.
        </p>

        <!-- Direct Connect Link -->
        <div style="margin: 8px 0 20px;">
          <a href="https://wa.me/918910759374?text=Hi%20Imagica%20Holidays%2C%20I%20am%20interested%20in%20your%20Diwali%20Festive%20Offers" target="_blank" style="display: inline-block; color: #0f172a; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px;">
            Connect with Concierge &rarr;
          </a>
        </div>
      </td>
    </tr>

    <!-- FULL-WIDTH SEAMLESS PHOTOGRAPHIC FLYER -->
    <tr>
      <td style="padding: 0 36px 26px; text-align: center; background-color: #ffffff;">
        <div style="border-radius: 3px; overflow: hidden; border: 1px solid #e7e2d8; box-shadow: 0 8px 24px rgba(0,0,0,0.04);">
          <a href="https://wa.me/918910759374?text=Hi%20Imagica%20Holidays%2C%20I%20am%20interested%20in%20your%20Diwali%20Festive%20Offers" target="_blank" style="display: block; text-decoration: none;">
            <img src="https://media.imagicaholidays.com/campaigns/diwali-festive-poster-2026.jpg" alt="Imagica Holidays Diwali Travel Collection" width="508" style="width: 100%; max-width: 508px; height: auto; display: block; margin: 0 auto; border: 0;" />
          </a>
        </div>
      </td>
    </tr>

    <!-- MINIMALIST ATTRACTIVE PRIVILEGE LOCKUP & PILL ACTIONS -->
    <tr>
      <td style="padding: 4px 36px 38px; text-align: center; background-color: #ffffff;">
        
        <!-- Minimalist Editorial Privilege Lockup (No clunky coupon box) -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 460px; margin: 0 auto 26px; border-top: 1px solid #eee8df; border-bottom: 1px solid #eee8df; padding: 22px 0;">
          <tr>
            <td align="center">
              <span style="display: block; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; font-size: 8.5px; font-weight: 800; letter-spacing: 3.5px; text-transform: uppercase; color: #8c733e; margin-bottom: 6px;">✦ &nbsp; FESTIVE PRIVILEGE &nbsp; ✦</span>
              <span style="display: block; font-family: 'Didot', 'Bodoni MT', 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #0f172a; letter-spacing: 6px; margin: 4px 0;">DIWALI2026</span>
              <span style="display: block; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #64748b; letter-spacing: 0.3px; margin-top: 4px;">Flat ₹3,000 Courtesy Savings &bull; Sikkim, Darjeeling, Kerala &amp; Andaman</span>
            </td>
          </tr>
        </table>

        <!-- Attractive Sleek Pill Buttons -->
        <div style="margin: 0 auto;">
          <a href="https://wa.me/918910759374?text=Hi%20Imagica%20Holidays%2C%20I%20am%20interested%20in%20your%20Diwali%20Festive%20Offers" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 13px 30px; border-radius: 50px; text-decoration: none; margin: 4px; border: 1px solid #c5a059; box-shadow: 0 4px 14px rgba(15,23,42,0.12);">
            💬 WhatsApp Concierge (+91 89107 59374)
          </a>
          <a href="https://imagicaholidays.com/destinations" target="_blank" style="display: inline-block; background-color: #ffffff; color: #0f172a; border: 1px solid #d1d5db; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; padding: 12px 26px; border-radius: 50px; text-decoration: none; margin: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            Explore Destinations &rarr;
          </a>
        </div>

      </td>
    </tr>

    <!-- MINIMALIST DESIGN-FULL FOOTER (SEAMLESS IVORY CANVAS WITH DESIGNER PILLS) -->
    <tr>
      <td style="background-color: #faf9f6; padding: 42px 28px 34px; text-align: center; border-top: 1px solid #eee8df;">
        
        <!-- Crisp Dark Transparent Logo -->
        <div style="margin-bottom: 14px;">
          <a href="https://imagicaholidays.com" target="_blank" style="text-decoration: none; display: inline-block;">
            <img src="https://media.imagicaholidays.com/campaigns/imagica-crm-logo-dark-trans.png" alt="Imagica Holidays" height="30" style="height: 30px; max-height: 30px; width: auto; margin: 0 auto; display: block; border: 0;" />
          </a>
        </div>

        <p style="margin: 0 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; font-size: 9px; font-weight: 800; letter-spacing: 3.5px; text-transform: uppercase; color: #8c733e;">
          Bespoke Journeys &bull; Kolkata, West Bengal
        </p>

        <!-- Minimalist Designer Contact Pills -->
        <div style="margin: 0 auto 18px;">
          <a href="https://wa.me/918910759374" target="_blank" style="display: inline-block; padding: 7px 16px; border: 1px solid #d1d5db; background: #ffffff; border-radius: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 600; color: #1e293b; text-decoration: none; margin: 3px 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            💬 WhatsApp Concierge
          </a>
          <a href="mailto:info@imagicaholidays.com" style="display: inline-block; padding: 7px 16px; border: 1px solid #d1d5db; background: #ffffff; border-radius: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 600; color: #1e293b; text-decoration: none; margin: 3px 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            ✉️ info@imagicaholidays.com
          </a>
          <a href="https://imagicaholidays.com" target="_blank" style="display: inline-block; padding: 7px 16px; border: 1px solid #d1d5db; background: #ffffff; border-radius: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 600; color: #1e293b; text-decoration: none; margin: 3px 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            🌐 imagicaholidays.com
          </a>
        </div>

        <div style="width: 32px; height: 1px; background-color: #d1d5db; margin: 0 auto 16px;"></div>

        <!-- Clean Legal & Address Line -->
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; font-size: 9.5px; color: #94a3b8; line-height: 1.7;">
          Head Office: 46, Barrackpore Trunk Rd, Khardaha, Kolkata 700117<br>
          &copy; 2026 Imagica Holidays. All rights reserved. &bull; <a href="mailto:info@imagicaholidays.com?subject=Unsubscribe" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
        </div>
      </td>
    </tr>

  </table>
</div>`
  },
  {
    id: 'winback_discount_deal',
    name: '✈️ Lost Lead Win-Back Voucher',
    description: 'Welcome back past inquiries with up to ₹5,000 festive savings on India tours',
    category: 'MARKETING',
    defaultOffer: 'Special Welcome Back Privilege: Save ₹3,000 to ₹5,000 on Gangtok, Pelling, Kerala & Andaman!',
    promoCode: 'COMEBACK3000',
    emailSubject: '✨ Exclusive Welcome Back Privilege: Up to ₹5,000 Savings on Your India Vacation',
    emailContent: `<div style="background-color: #f1f5f9; padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; margin: 0 auto;">
    
    <!-- Top Luxury Header Banner -->
    <tr>
      <td style="background: linear-gradient(135deg, #091e2f 0%, #0f2b48 100%); padding: 34px 24px 26px; text-align: center; border-bottom: 3px solid #d4af37;">
        <img src="https://imagicaholidays.com/logo_new.png" alt="Imagica Holidays" style="max-height: 52px; width: auto; margin-bottom: 8px; display: inline-block;" />
        <p style="margin: 0; color: #d4af37; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">Bespoke Journeys & Luxury Retreats</p>
      </td>
    </tr>

    <!-- Welcome Back Hero -->
    <tr>
      <td style="padding: 34px 30px 22px; background-color: #f8fafc; text-align: center; border-bottom: 1px solid #e2e8f0;">
        <span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px;">🌟 Exclusive Re-Engagement Privilege</span>
        <h1 style="margin: 0 0 10px; font-family: Georgia, serif; font-size: 24px; line-height: 1.3; color: #0f172a; font-weight: bold;">
          We Would Love to Plan Your Next Journey
        </h1>
        <p style="margin: 0 auto; font-size: 14px; color: #64748b; line-height: 1.6; max-width: 490px;">
          Dear <strong>{{name}}</strong>, you previously connected with us for your holiday. We would love the opportunity to curate your dream getaway across India with exclusive returning-guest privileges.
        </p>
      </td>
    </tr>

    <!-- Destination Highlights -->
    <tr>
      <td style="padding: 28px 24px 14px;">
        <!-- Destination 1: Gangtok & North Sikkim -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <tr>
            <td width="38%" style="vertical-align: middle; background-color: #0f172a;">
              <img src="https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=600" alt="Gangtok Sikkim" style="width: 100%; height: 135px; object-fit: cover; display: block;" />
            </td>
            <td width="62%" style="padding: 14px 16px; vertical-align: top;">
              <span style="font-size: 10px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 1px;">Himalayan Heights</span>
              <h3 style="margin: 3px 0 5px; font-size: 15px; color: #0f172a; font-weight: 700;">Gangtok, Lachung & Yumthang</h3>
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; line-height: 1.4;">Snow valleys, alpine lakes, boutique hotel stays & private sanitized vehicle.</p>
              <div style="font-size: 13px;">
                <span style="font-size: 11px; color: #94a3b8; text-decoration: line-through;">₹14,999</span>
                <strong style="color: #0f172a; font-size: 15px; margin-left: 6px;">₹11,999/-</strong>
                <span style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Save ₹3,000</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- Destination 2: Darjeeling & Pelling -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <tr>
            <td width="38%" style="vertical-align: middle; background-color: #0f172a;">
              <img src="https://media.imagicaholidays.com/destinations/667316a3-b64a-4c68-9ba8-c5a1b257df77-aman-upadhyay-5nPDGyAmZ10-unsplash.webp" alt="Darjeeling Pelling" style="width: 100%; height: 135px; object-fit: cover; display: block;" />
            </td>
            <td width="62%" style="padding: 14px 16px; vertical-align: top;">
              <span style="font-size: 10px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 1px;">Queen of Hills</span>
              <h3 style="margin: 3px 0 5px; font-size: 15px; color: #0f172a; font-weight: 700;">Darjeeling Heritage & Pelling Skywalk</h3>
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; line-height: 1.4;">Tiger Hill sunrise, tea estate walks, glass skywalk & scenic valley drives.</p>
              <div style="font-size: 13px;">
                <span style="font-size: 11px; color: #94a3b8; text-decoration: line-through;">₹13,499</span>
                <strong style="color: #0f172a; font-size: 15px; margin-left: 6px;">₹10,499/-</strong>
                <span style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Save ₹3,000</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- Destination 3: Kerala & Andaman -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <tr>
            <td width="38%" style="vertical-align: middle; background-color: #0f172a;">
              <img src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600" alt="Kerala Andaman" style="width: 100%; height: 135px; object-fit: cover; display: block;" />
            </td>
            <td width="62%" style="padding: 14px 16px; vertical-align: top;">
              <span style="font-size: 10px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px;">Tropical Bliss</span>
              <h3 style="margin: 3px 0 5px; font-size: 15px; color: #0f172a; font-weight: 700;">Kerala Backwaters & Andaman Islands</h3>
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; line-height: 1.4;">Private houseboat cruise in Alleppey, Radhanagar beach resorts & scuba reefs.</p>
              <div style="font-size: 13px;">
                <span style="font-size: 11px; color: #94a3b8; text-decoration: line-through;">₹16,999</span>
                <strong style="color: #0f172a; font-size: 15px; margin-left: 6px;">₹12,999/-</strong>
                <span style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Save up to ₹4,000</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Voucher Code -->
    <tr>
      <td style="padding: 0 24px 22px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 18px;">
          <tr>
            <td style="text-align: center;">
              <span style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 1.5px;">🎁 Returning Guest Welcome Voucher</span>
              <p style="margin: 8px 0 14px; font-size: 12px; color: #475569;">
                Additional ₹3,000 instant reduction on any domestic booking confirmed this month.
              </p>
              <div style="display: inline-block; background: #0f172a; color: #4ade80; padding: 8px 22px; border-radius: 8px; font-family: monospace; font-size: 15px; font-weight: bold; letter-spacing: 2px;">
                CODE: COMEBACK3000
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- WhatsApp CTA Button -->
    <tr>
      <td style="padding: 6px 24px 34px; text-align: center;">
        <p style="margin: 0 0 16px; font-size: 14px; color: #475569;">
          Ready to customize your itinerary? Ping our lead concierge directly:
        </p>
        <a href="https://api.whatsapp.com/send/?phone=918910759374&text=Hi%21+I%27d+like+to+plan+a+trip+with+Imagica+Holidays.&type=phone_number&app_absent=0" style="display: inline-block; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 15px; box-shadow: 0 6px 20px rgba(37,211,102,0.35);">
          💬 Chat with Travel Concierge (+91 89107 59374)
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #0f172a; padding: 26px 20px; text-align: center; border-top: 1px solid #1e293b; color: #94a3b8; font-size: 12px; line-height: 1.6;">
        <strong style="color: #ffffff; font-size: 13px;">IMAGICA HOLIDAYS</strong><br />
        🌐 <a href="https://imagicaholidays.com" style="color: #d4af37; text-decoration: none;">imagicaholidays.com</a> &nbsp;|&nbsp; 📞 +91 89107 59374
      </td>
    </tr>

  </table>
</div>`
  },
  {
    id: 'completed_loyalty_referral',
    name: '🏆 Past Traveler Loyalty & Referral Reward',
    description: 'Exclusive loyalty travel credits & referral rewards for completed travelers',
    category: 'MARKETING',
    defaultOffer: 'VIP Traveler Privilege: Up to ₹5,000 Repeat Travel Credit + ₹2,500 Referral Bonus on Kerala, Andaman & Sikkim!',
    promoCode: 'VIPLOYALTY',
    emailSubject: '🌟 An Exclusive Festive Privilege for Our Valued Traveler',
    emailContent: `<div style="background-color: #f1f5f9; padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; margin: 0 auto;">
    
    <!-- Top Luxury Header Banner -->
    <tr>
      <td style="background: linear-gradient(135deg, #091e2f 0%, #0f2b48 100%); padding: 34px 24px 26px; text-align: center; border-bottom: 3px solid #d4af37;">
        <img src="https://imagicaholidays.com/logo_new.png" alt="Imagica Holidays" style="max-height: 52px; width: auto; margin-bottom: 8px; display: inline-block;" />
        <p style="margin: 0; color: #d4af37; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">Bespoke Journeys & Luxury Retreats</p>
      </td>
    </tr>

    <!-- VIP Hero -->
    <tr>
      <td style="padding: 34px 30px 22px; background-color: #fffbf2; text-align: center; border-bottom: 1px solid #fef3c7;">
        <span style="display: inline-block; background-color: #fef08a; color: #854d0e; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px;">🏆 VIP Guest Privileges</span>
        <h1 style="margin: 0 0 10px; font-family: Georgia, serif; font-size: 24px; line-height: 1.3; color: #0f172a; font-weight: bold;">
          Thank You For Journeying With Us
        </h1>
        <p style="margin: 0 auto; font-size: 14px; color: #64748b; line-height: 1.6; max-width: 490px;">
          Dear <strong>{{name}}</strong>, it was our absolute honor to host your recent trip. As a distinguished Imagica traveler, you hold lifetime VIP privileges for all your upcoming travels.
        </p>
      </td>
    </tr>

    <!-- VIP Benefits Box -->
    <tr>
      <td style="padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
          <tr>
            <td>
              <h3 style="margin: 0 0 10px; font-size: 15px; color: #0f172a;">Your Exclusive Tier Privileges:</h3>
              <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #475569; line-height: 1.8;">
                <li><strong>₹5,000 Instant Travel Credit</strong> on your next booking across Sikkim, Darjeeling, Kerala, or Andaman.</li>
                <li><strong>Referral Bonus:</strong> Friends or family you refer receive an instant ₹2,500 privilege!</li>
                <li><strong>Complimentary Room Upgrade</strong> to luxury boutique suites upon availability.</li>
              </ul>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fefce8; border: 2px dashed #ca8a04; border-radius: 12px; padding: 18px; text-align: center;">
          <tr>
            <td>
              <div style="font-size: 12px; font-weight: bold; color: #854d0e; margin-bottom: 8px;">YOUR VIP CODE</div>
              <div style="display: inline-block; background: #0f172a; color: #fde047; padding: 8px 22px; border-radius: 8px; font-family: monospace; font-size: 15px; font-weight: bold; letter-spacing: 2px;">
                CODE: VIPLOYALTY
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- WhatsApp CTA Button -->
    <tr>
      <td style="padding: 6px 24px 34px; text-align: center;">
        <a href="https://api.whatsapp.com/send/?phone=918910759374&text=Hi%21+I%27d+like+to+plan+a+trip+with+Imagica+Holidays.&type=phone_number&app_absent=0" style="display: inline-block; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: #ffffff; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 15px; box-shadow: 0 6px 20px rgba(37,211,102,0.35);">
          💬 Connect with VIP Concierge (+91 89107 59374)
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #0f172a; padding: 26px 20px; text-align: center; border-top: 1px solid #1e293b; color: #94a3b8; font-size: 12px; line-height: 1.6;">
        <strong style="color: #ffffff; font-size: 13px;">IMAGICA HOLIDAYS</strong><br />
        🌐 <a href="https://imagicaholidays.com" style="color: #d4af37; text-decoration: none;">imagicaholidays.com</a> &nbsp;|&nbsp; 📞 +91 89107 59374
      </td>
    </tr>

  </table>
</div>`
  }
];

export default function MarketingBroadcastPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [segment, setSegment] = useState<'lost' | 'completed'>('lost');
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'both'>('both');

  // Audience Data
  const [audience, setAudience] = useState<RecipientItem[]>([]);
  const [loadingAudience, setLoadingAudience] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Campaign Form
  const [campaignName, setCampaignName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(TEMPLATE_PRESETS[0]);
  const [offerText, setOfferText] = useState(TEMPLATE_PRESETS[0].defaultOffer);
  const [promoCode, setPromoCode] = useState(TEMPLATE_PRESETS[0].promoCode);
  const [emailSubject, setEmailSubject] = useState(TEMPLATE_PRESETS[0].emailSubject);
  const [emailContent, setEmailContent] = useState(TEMPLATE_PRESETS[0].emailContent);
  const [emailViewMode, setEmailViewMode] = useState<'preview' | 'html'>('preview');
  const [skipRecentDays, setSkipRecentDays] = useState(true);

  // Dedicated Concierge WhatsApp Routing (Team Member Number)
  const [conciergePhone, setConciergePhone] = useState('918910759374');
  const [conciergeMessage, setConciergeMessage] = useState("Hi! I'd like to plan a trip with Imagica Holidays.");

  // Computed Concierge WhatsApp Link
  const conciergeWhatsAppUrl = useMemo(() => {
    const cleanPhone = conciergePhone.replace(/\D/g, '') || '918910759374';
    const encodedText = encodeURIComponent(conciergeMessage);
    return `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodedText}&type=phone_number&app_absent=0`;
  }, [conciergePhone, conciergeMessage]);

  // File Upload
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; filename: string; size?: number } | null>(null);

  // Launching state
  const [launching, setLaunching] = useState(false);

  // Campaign History
  const [history, setHistory] = useState<CampaignHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Stats
  const [stats, setStats] = useState<{ totalCampaigns: number; totalSent: number; totalFailed: number } | null>(null);

  // Load Audience whenever segment changes
  useEffect(() => {
    fetchAudience();
    fetchStats();
  }, [segment]);

  const fetchAudience = async () => {
    setLoadingAudience(true);
    try {
      const res = await api.get(`/broadcasts/audience?segment=${segment}`);
      if (res.data.success) {
        setAudience(res.data.data || []);
        // Reset selections to empty by default
        setSelectedIds(new Set());
      }
    } catch (err: any) {
      toast.error('Failed to load audience list: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingAudience(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/broadcasts/campaigns');
      if (res.data.success) {
        setHistory(res.data.data || []);
      }
    } catch (err: any) {
      toast.error('Failed to load campaign history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/broadcasts/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      // quiet fail
    }
  };

  // Switch template preset
  const handleApplyPreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    setSelectedPreset(preset);
    setOfferText(preset.defaultOffer);
    setPromoCode(preset.promoCode);
    setEmailSubject(preset.emailSubject);
    setEmailContent(preset.emailContent);
    if (!campaignName) {
      setCampaignName(`${preset.name.replace(/[^\w\s-]/g, '').trim()} - ${new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`);
    }
    toast.success(`Applied template: ${preset.name}`);
  };

  // Filtered audience
  const filteredAudience = useMemo(() => {
    if (!searchQuery.trim()) return audience;
    const q = searchQuery.toLowerCase();
    return audience.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        (item.phone && item.phone.includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.destination && item.destination.toLowerCase().includes(q)) ||
        item.queryCode.toLowerCase().includes(q)
    );
  }, [audience, searchQuery]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredAudience.map(item => item.queryId));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleOne = (queryId: string) => {
    const next = new Set(selectedIds);
    if (next.has(queryId)) {
      next.delete(queryId);
    } else {
      next.add(queryId);
    }
    setSelectedIds(next);
  };

  const handleSelectWhatsAppOnly = () => {
    const ids = new Set(filteredAudience.filter(item => item.hasPhone).map(item => item.queryId));
    setSelectedIds(ids);
    toast.info(`Selected ${ids.size} contacts with phone numbers.`);
  };

  const handleSelectEmailOnly = () => {
    const ids = new Set(filteredAudience.filter(item => item.hasEmail).map(item => item.queryId));
    setSelectedIds(ids);
    toast.info(`Selected ${ids.size} contacts with email addresses.`);
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds 25MB limit.');
      return;
    }

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/broadcasts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.data?.url) {
        const uploadedUrl = res.data.data.url;
        setAttachment({
          url: uploadedUrl,
          filename: res.data.data.filename || file.name,
          size: file.size,
        });
        if (/\.(jpe?g|png|webp)$/i.test(uploadedUrl)) {
          setEmailContent(prev => {
            if (prev.includes('https://media.imagicaholidays.com/campaigns/diwali-festive-poster-2026.jpg')) {
              return prev.replaceAll('https://media.imagicaholidays.com/campaigns/diwali-festive-poster-2026.jpg', uploadedUrl);
            }
            return prev;
          });
        }
        toast.success(`Attached "${file.name}" successfully!`);
      }
    } catch (err: any) {
      toast.error('File upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingFile(false);
    }
  };

  // Launch campaign
  const handleLaunch = async () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least 1 recipient.');
      return;
    }

    const defaultName = campaignName.trim() || `${segment === 'lost' ? 'Lost Inquiries Win-Back' : 'Past Travelers Reward'} - ${new Date().toLocaleDateString('en-IN')}`;

    // Get selected recipient details
    const selectedRecipients = audience
      .filter(item => selectedIds.has(item.queryId))
      .map(item => ({
        queryId: item.queryId,
        name: item.name,
        phone: item.phone,
        email: item.email,
        destination: item.destination,
      }));

    setLaunching(true);
    try {
      // Step 1: Create Campaign
      const createRes = await api.post('/broadcasts/campaigns', {
        name: defaultName,
        segment,
        channel,
        templateName: selectedPreset.id,
        emailSubject,
        emailContent,
        attachmentUrl: attachment?.url || null,
        attachmentName: attachment?.filename || null,
        conciergePhone,
        conciergeUrl: conciergeWhatsAppUrl,
        recipients: selectedRecipients,
      });

      if (!createRes.data.success) {
        throw new Error(createRes.data.message || 'Failed to create campaign');
      }

      const campaignId = createRes.data.data.id;

      // Step 2: Launch Campaign
      const launchRes = await api.post(`/broadcasts/campaigns/${campaignId}/launch`);
      if (launchRes.data.success) {
        toast.success(`🎉 Campaign "${defaultName}" launched successfully! Queued for dispatch.`);
        // Switch to history tab
        setActiveTab('history');
        fetchHistory();
        fetchStats();
      }
    } catch (err: any) {
      toast.error('Launch failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLaunching(false);
    }
  };

  // Calculations for selection & channel routing
  const selectedItems = useMemo(() => {
    return audience.filter(item => selectedIds.has(item.queryId));
  }, [audience, selectedIds]);

  const reachablePhoneCount = selectedItems.filter(i => i.hasPhone).length;
  const reachableEmailCount = selectedItems.filter(i => i.hasEmail).length;

  const whatsappRecipientsCount = useMemo(() => {
    if (channel === 'email') return 0;
    return reachablePhoneCount;
  }, [channel, reachablePhoneCount]);

  const emailRecipientsCount = useMemo(() => {
    if (channel === 'whatsapp') return 0;
    return reachableEmailCount;
  }, [channel, reachableEmailCount]);

  // Meta charges ~₹0.78 per marketing conversation in India. Email is completely free.
  const estimatedCost = useMemo(() => {
    if (channel === 'email') return 0;
    return Number((whatsappRecipientsCount * 0.78).toFixed(2));
  }, [channel, whatsappRecipientsCount]);

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Marketing Broadcast Hub</h1>
              <p className="text-sm text-muted-foreground">
                Re-engage lost inquiries & reward past travelers with festive offers via WhatsApp & Email
              </p>
            </div>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-muted/50 border rounded-lg px-3 py-1.5 text-xs">
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Total Campaigns</span>
            <span className="font-bold text-foreground text-sm">{stats?.totalCampaigns ?? 0}</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-emerald-700 dark:text-emerald-300 block text-[10px] uppercase font-semibold">Messages Sent</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">{stats?.totalSent ?? 0}</span>
          </div>
          <div className={cn(
            "border rounded-lg px-3 py-1.5 text-xs",
            channel === 'email' 
              ? "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300"
              : channel === 'whatsapp'
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
          )}>
            <span className="block text-[10px] uppercase font-semibold opacity-75">Active Channel</span>
            <span className="font-bold text-sm">
              {channel === 'email' ? 'Email Only (100% Free)' : channel === 'whatsapp' ? 'WhatsApp Only (~₹0.78)' : 'Dual (WA + Email)'}
            </span>
          </div>
        </div>
      </div>

      {/* Top Level Mode Tabs (Full Width - eliminates the blank left space) */}
      <div className="flex items-center justify-between border-b pb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer",
              activeTab === 'create'
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span>New Broadcast</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              fetchHistory();
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer",
              activeTab === 'history'
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
            )}
          >
            <Clock className="h-4 w-4" />
            <span>Campaign History ({history.length || stats?.totalCampaigns || 0})</span>
          </button>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>BullMQ Anti-Spam Throttled Queue Active</span>
        </div>
      </div>

      {/* ── CREATE CAMPAIGN CONTENT ── */}
      {activeTab === 'create' ? (
        <div className="space-y-6 w-full">
          {/* STEP 1: AUDIENCE SELECTOR & SEGMENT */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                    <CardTitle className="text-base font-semibold">Select Target Audience Segment</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    Choose who you want to reach. Records are automatically deduplicated by phone & email.
                  </CardDescription>
                </div>

                {/* Segment Pill Switcher */}
                <div className="flex items-center p-1 bg-muted rounded-lg border">
                  <button
                    type="button"
                    onClick={() => setSegment('lost')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                      segment === 'lost' 
                        ? "bg-background text-foreground shadow-sm font-semibold" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Flame className="h-3.5 w-3.5 text-rose-500" />
                    <span>Lost Inquiries ({segment === 'lost' ? audience.length : '...'})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSegment('completed')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                      segment === 'completed' 
                        ? "bg-background text-foreground shadow-sm font-semibold" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Gift className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Completed Tours ({segment === 'completed' ? audience.length : '...'})</span>
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Audience Table Filters & Quick Action Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/30 p-3 rounded-lg border">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name, phone, destination..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Quick Select:</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSelectAll(true)}
                    className="h-8 text-xs"
                  >
                    Select All ({filteredAudience.length})
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectWhatsAppOnly}
                    className="h-8 text-xs text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    With WhatsApp
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectEmailOnly}
                    className="h-8 text-xs text-blue-700 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    With Email
                  </Button>
                  {selectedIds.size > 0 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedIds(new Set())}
                      className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
              </div>

              {/* Interactive Recipient Grid */}
              <div className="border rounded-lg overflow-hidden max-h-[340px] overflow-y-auto">
                {loadingAudience ? (
                  <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                    <p className="text-xs">Loading deduplicated audience...</p>
                  </div>
                ) : filteredAudience.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-xs">
                    No contacts found in this segment matching your search.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-muted/70 sticky top-0 z-10 border-b text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={filteredAudience.length > 0 && selectedIds.size === filteredAudience.length}
                            onChange={e => handleSelectAll(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary cursor-pointer accent-primary"
                          />
                        </th>
                        <th className="p-3">Customer / Query</th>
                        <th className="p-3">Contact Details</th>
                        <th className="p-3">Destination</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Eligible Channels</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredAudience.map(item => {
                        const isSelected = selectedIds.has(item.queryId);
                        return (
                          <tr
                            key={item.queryId}
                            onClick={() => handleToggleOne(item.queryId)}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-muted/40",
                              isSelected ? "bg-primary/5 font-medium" : ""
                            )}
                          >
                            <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleOne(item.queryId)}
                                className="h-4 w-4 rounded border-gray-300 text-primary cursor-pointer accent-primary"
                              />
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-foreground">{item.name}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{item.queryCode}</div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="h-3 w-3 text-emerald-600" />
                                <span>{item.phone || '—'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                <Mail className="h-3 w-3 text-blue-600" />
                                <span className="truncate max-w-[160px]">{item.email || '—'}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-medium text-foreground">{item.destination || 'General Inquiry'}</span>
                            </td>
                            <td className="p-3">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] uppercase font-semibold capitalize",
                                  item.status === 'lost' ? "border-rose-300 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" :
                                  item.status === 'completed' ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" :
                                  "border-amber-300 bg-amber-50 text-amber-700"
                                )}
                              >
                                {item.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {item.hasPhone && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    WA
                                  </span>
                                )}
                                {item.hasEmail && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                    Email
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Selection Summary Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground pt-1 gap-2">
                <div>
                  Showing {filteredAudience.length} of {audience.length} deduplicated contacts.
                </div>
                <div className="flex items-center gap-3 font-medium">
                  <span className="text-primary font-bold">
                    ✓ {selectedIds.size} Selected
                  </span>
                  <span>
                    (WhatsApp: {reachablePhoneCount} | Email: {reachableEmailCount})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STEP 2: CAMPAIGN DETAILS & CHANNELS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Controls */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                    <CardTitle className="text-base font-semibold">Campaign Message & Channels</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Configure your message content, discount offer, and delivery channels.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Campaign Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Campaign Name</Label>
                    <Input
                      placeholder="e.g. Diwali Win-Back Campaign 2026"
                      value={campaignName}
                      onChange={e => setCampaignName(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  {/* Channel Selection Toggle */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Dispatch Channel</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div
                        onClick={() => setChannel('both')}
                        className={cn(
                          "cursor-pointer border rounded-lg p-3 text-center transition-all",
                          channel === 'both' 
                            ? "border-primary bg-primary/5 ring-1 ring-primary" 
                            : "hover:border-muted-foreground/30"
                        )}
                      >
                        <div className="font-semibold text-xs flex items-center justify-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-primary" />
                          <span>Both Channels</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Smart dual delivery (WA + Email)</p>
                      </div>

                      <div
                        onClick={() => setChannel('whatsapp')}
                        className={cn(
                          "cursor-pointer border rounded-lg p-3 text-center transition-all",
                          channel === 'whatsapp' 
                            ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500" 
                            : "hover:border-muted-foreground/30"
                        )}
                      >
                        <div className="font-semibold text-xs flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                          <Phone className="h-3.5 w-3.5" />
                          <span>WhatsApp Only</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">~95% open rate via Meta API</p>
                      </div>

                      <div
                        onClick={() => setChannel('email')}
                        className={cn(
                          "cursor-pointer border rounded-lg p-3 text-center transition-all",
                          channel === 'email' 
                            ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500" 
                            : "hover:border-muted-foreground/30"
                        )}
                      >
                        <div className="font-semibold text-xs flex items-center justify-center gap-1.5 text-blue-700 dark:text-blue-400">
                          <Mail className="h-3.5 w-3.5" />
                          <span>Email Only</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Free Brevo delivery + flyer</p>
                      </div>
                    </div>
                  </div>

                  {/* Preset Template Selector */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Offer Template Preset</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {TEMPLATE_PRESETS.map(preset => {
                        const isChosen = selectedPreset.id === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className={cn(
                              "text-left p-2.5 rounded-lg border transition-all text-xs",
                              isChosen ? "border-primary bg-primary/5 font-semibold ring-1 ring-primary" : "hover:border-muted-foreground/40"
                            )}
                          >
                            <div className="truncate font-medium">{preset.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate mt-0.5">{preset.promoCode}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Template Parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Discount / Offer Highlight</Label>
                      <Input
                        value={offerText}
                        onChange={e => setOfferText(e.target.value)}
                        placeholder="e.g. Up to ₹15,000 OFF on Holiday Packages"
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Coupon / Promo Code</Label>
                      <Input
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                        placeholder="e.g. DIWALI2026"
                        className="h-9 text-xs font-mono font-bold uppercase"
                      />
                    </div>
                  </div>

                  {/* Dedicated Concierge WhatsApp Routing (Team Member Number) */}
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-lg p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        <span>Travel Concierge Routing (Destination Team Number)</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300">
                        Incoming Lead Destination
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      When customers click <strong>&quot;Chat with Travel Concierge&quot;</strong>, their chat will open directly with this team member&apos;s phone number.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-emerald-950 dark:text-emerald-200">Team Member WhatsApp Number</Label>
                        <Input
                          value={conciergePhone}
                          onChange={e => setConciergePhone(e.target.value)}
                          placeholder="918910759374"
                          className="h-8 text-xs font-mono bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-medium text-emerald-950 dark:text-emerald-200">Pre-filled Customer Message</Label>
                        <Input
                          value={conciergeMessage}
                          onChange={e => setConciergeMessage(e.target.value)}
                          placeholder="Hi! I'd like to plan a trip with Imagica Holidays."
                          className="h-8 text-xs bg-white dark:bg-zinc-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Specific Inputs */}
                  {(channel === 'email' || channel === 'both') && (
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <Mail className="h-4 w-4" />
                        <span>Email Channel Content</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Email Subject Line</Label>
                        <Input
                          value={emailSubject}
                          onChange={e => setEmailSubject(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium">Email Message Body</Label>
                          <div className="flex items-center gap-1 bg-muted p-0.5 rounded text-[11px]">
                            <button
                              type="button"
                              onClick={() => setEmailViewMode('preview')}
                              className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${emailViewMode === 'preview' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                              👁️ Visual Live Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => setEmailViewMode('html')}
                              className={`px-2.5 py-0.5 rounded font-medium transition-all cursor-pointer ${emailViewMode === 'html' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                              💻 Edit HTML Source
                            </button>
                          </div>
                        </div>

                        {emailViewMode === 'preview' ? (
                          <div className="border rounded-lg p-2 bg-slate-100 dark:bg-zinc-950 max-h-[460px] overflow-y-auto">
                            <div
                              className="rounded-lg shadow-xs overflow-hidden"
                              dangerouslySetInnerHTML={{
                                __html: emailContent
                                  .replace(/\{\{name\}\}/g, 'Valued Traveler')
                                  .replace(/\{\{destination\}\}/g, 'Sikkim & Darjeeling')
                              }}
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Textarea
                              rows={8}
                              value={emailContent}
                              onChange={e => setEmailContent(e.target.value)}
                              className="text-xs font-mono"
                            />
                            <p className="text-[10px] text-muted-foreground">
                              Available tags: <code className="bg-muted px-1 py-0.2 rounded font-mono">{'{{name}}'}</code>, <code className="bg-muted px-1 py-0.2 rounded font-mono">{'{{destination}}'}</code>. Renders responsive on all mobile & desktop email clients.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attachment Section (PDF / Flyer) */}
                  <div className="border-t pt-4 space-y-2">
                    <Label className="text-xs font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>Attach Offer Flyer or Tour Catalog (PDF / Image)</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">Max 25MB</span>
                    </Label>

                    {attachment ? (
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/40">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="h-5 w-5 text-rose-500 shrink-0" />
                          <div className="truncate text-xs">
                            <span className="font-semibold text-foreground">{attachment.filename}</span>
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline ml-2 text-[10px] inline-flex items-center gap-0.5"
                            >
                              <span>Preview</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAttachment(null)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/30 transition-colors">
                        <input
                          type="file"
                          id="flyer-upload"
                          accept=".pdf,image/png,image/jpeg,image/webp"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploadingFile}
                        />
                        <label
                          htmlFor="flyer-upload"
                          className="cursor-pointer flex flex-col items-center justify-center gap-1"
                        >
                          {uploadingFile ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          ) : (
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          )}
                          <span className="text-xs font-semibold text-foreground">
                            {uploadingFile ? 'Uploading to cloud...' : 'Click to upload Diwali Flyer / Catalog'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Delivered directly as a downloadable PDF in WhatsApp & attached in Email
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 1 Col: Live Preview & Launch Card */}
            <div className="space-y-6">
              {/* WhatsApp Live Preview Bubble */}
              <Card className="border-border shadow-sm overflow-hidden">
                <CardHeader className="bg-emerald-600 text-white p-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-xs font-bold">WhatsApp Live Message Preview</span>
                  </div>
                </CardHeader>
                <CardContent className="p-3 bg-[#E5DDD5] dark:bg-zinc-900 min-h-[300px] flex flex-col justify-between">
                  <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 shadow text-xs space-y-2 max-w-[95%] border">
                    {/* Header Poster Flyer Preview */}
                    {(selectedPreset.id === 'diwali_festive_poster' || attachment) && (
                      <div className="rounded-md overflow-hidden border border-emerald-200/60 shadow-xs mb-2 bg-black/5">
                        <img
                          src={attachment?.url || 'https://media.imagicaholidays.com/campaigns/diwali-festive-poster-2026.jpg'}
                          alt="Festive Flyer"
                          className="w-full h-44 object-cover object-top hover:object-contain transition-all"
                        />
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 text-[10px] font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                          <span>🪔 Diwali Festive Flyer</span>
                          <span className="text-[9px] opacity-75">{attachment ? attachment.filename : 'Cloudflare R2'}</span>
                        </div>
                      </div>
                    )}

                    <div className="text-zinc-800 dark:text-zinc-100 text-xs leading-relaxed">
                      Dear <strong>{'{{Customer Name}}'}</strong>,
                      <br /><br />
                      Hi, how are you? Happy Diwali! 🪔✨
                      <br /><br />
                      Our exclusive festive holiday offers are now live with <strong>Flat ₹3,000 OFF</strong> on all bespoke packages across Sikkim, Darjeeling, Kerala & Andaman.
                      <br /><br />
                      Use Code: <strong className="text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-mono">{promoCode || 'DIWALI2026'}</strong>
                      <br /><br />
                      Please check our festive flyer above. Our concierge team in Kolkata is at your service to craft your dream holiday.
                      <br /><br />
                      Warm regards,<br />
                      <strong>Imagica Holidays, Kolkata ✈️</strong>
                    </div>

                    <div className="pt-2 border-t space-y-1.5">
                      <a
                        href="https://imagicaholidays.com/destinations"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white dark:bg-zinc-700 hover:bg-zinc-50 border text-emerald-700 dark:text-emerald-300 text-center py-2 px-3 rounded text-[11px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer no-underline"
                      >
                        <span>🌐 Explore Packages</span>
                        <ExternalLink className="h-3 w-3 opacity-90" />
                      </a>
                      <a
                        href={conciergeWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-[#25D366] hover:bg-[#20bd5a] text-white text-center py-2 px-3 rounded text-[11px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer no-underline"
                        title={`Click to test opening WhatsApp chat to +${conciergePhone}`}
                      >
                        <span>💬 Chat with Concierge (+91 89107 59374)</span>
                        <ExternalLink className="h-3 w-3 opacity-90 group-hover:opacity-100" />
                      </a>
                      <div className="bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-center py-1 rounded text-[10px]">
                        🛑 Stop Promotions
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-center text-zinc-500 mt-2">
                    Delivered via official Meta Cloud API
                  </div>
                </CardContent>
              </Card>

              {/* Launch & Safety Confirmation Card */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Launch & Safeguards</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cost & Recipient Stats */}
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Selected Contacts:</span>
                      <span className="font-bold">{selectedIds.size}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3 text-emerald-600" />
                        <span>WhatsApp Queue:</span>
                      </span>
                      {channel === 'email' ? (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">
                          0 (Disabled)
                        </Badge>
                      ) : (
                        <span className="font-semibold text-emerald-600">{whatsappRecipientsCount} recipients</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3 text-blue-600" />
                        <span>Email Queue:</span>
                      </span>
                      {channel === 'whatsapp' ? (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-dashed">
                          0 (Disabled)
                        </Badge>
                      ) : (
                        <span className="font-semibold text-blue-600">{emailRecipientsCount} recipients</span>
                      )}
                    </div>

                    <div className="border-t pt-2 flex justify-between items-center font-bold">
                      <span>Est. Meta WhatsApp Fee:</span>
                      {channel === 'email' ? (
                        <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded text-xs">
                          ₹0.00 (100% Free / Brevo)
                        </span>
                      ) : estimatedCost === 0 ? (
                        <span className="text-muted-foreground font-medium">₹0.00</span>
                      ) : (
                        <div className="text-right">
                          <span className="text-emerald-600 text-sm">~₹{estimatedCost}</span>
                          <span className="block text-[10px] font-normal text-muted-foreground">(@ ₹0.78 / conversation)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Safety Checkbox */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="skip-recent"
                      checked={skipRecentDays}
                      onChange={e => setSkipRecentDays(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary accent-primary"
                    />
                    <label htmlFor="skip-recent" className="text-xs text-muted-foreground cursor-pointer">
                      <strong>Cooling-off Protection:</strong> Exclude anyone messaged in last 14 days to prevent spam reports.
                    </label>
                  </div>

                  {/* Launch Button */}
                  <Button
                    type="button"
                    onClick={handleLaunch}
                    disabled={launching || selectedIds.size === 0}
                    className="w-full h-11 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 shadow-md"
                  >
                    {launching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Launching Broadcast...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Launch Broadcast ({selectedIds.size})</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* ── CAMPAIGN HISTORY CONTENT ── */
        <div className="space-y-4 w-full">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Broadcast Campaign History</CardTitle>
                <CardDescription className="text-xs">
                  Review all previously dispatched promotional broadcasts and delivery statuses.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchHistory}
                disabled={loadingHistory}
                className="h-8 text-xs"
              >
                <RefreshCw className={cn("h-3 w-3 mr-1", loadingHistory && "animate-spin")} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                  <p className="text-xs">Loading campaign history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  No broadcast campaigns launched yet. Create your first campaign above!
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-muted/70 border-b text-[11px] font-semibold text-muted-foreground uppercase">
                      <tr>
                        <th className="p-3">Campaign Name</th>
                        <th className="p-3">Target Segment</th>
                        <th className="p-3">Channel</th>
                        <th className="p-3 text-center">Recipients</th>
                        <th className="p-3 text-center">Sent / Failed</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Launched Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {history.map(item => (
                        <tr key={item.id} className="hover:bg-muted/30">
                          <td className="p-3 font-semibold text-foreground">
                            {item.name}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {item.segment}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <span className="text-[11px] uppercase font-semibold text-muted-foreground">
                              {item.channel}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold">
                            {item.totalRecipients}
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-emerald-600 font-semibold">{item.sentCount}</span>
                            {' / '}
                            <span className="text-rose-500 font-semibold">{item.failedCount}</span>
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-semibold capitalize",
                                item.status === 'completed' ? "border-emerald-300 bg-emerald-50 text-emerald-700" :
                                item.status === 'sending' ? "border-blue-300 bg-blue-50 text-blue-700 animate-pulse" :
                                item.status === 'failed' ? "border-rose-300 bg-rose-50 text-rose-700" :
                                "border-muted"
                              )}
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right text-muted-foreground font-mono text-[11px]">
                            {item.launchedAt ? new Date(item.launchedAt).toLocaleString('en-IN') : new Date(item.createdAt).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
