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
    id: 'festive_exclusive_offer',
    name: '🪔 Diwali / Festive Grand Offer',
    description: 'Bespoke Festive Retreats across Sikkim, Darjeeling, Kerala & Andaman (Flat ₹3,000 OFF)',
    category: 'MARKETING',
    defaultOffer: 'Diwali Special Offer: Flat ₹3,000 OFF on All Packages (Code: DIWALI2026) across Gangtok, Darjeeling, Kerala & Andaman!',
    promoCode: 'DIWALI2026',
    emailSubject: '🪔 This Diwali: Gift Yourself Extraordinary Journeys — Flat ₹3,000 OFF on All Packages',
    emailContent: `<div style="background-color: #12151c; padding: 24px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; background-color: #faf7f2; border-radius: 12px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.4); border: 1px solid #2d3748; margin: 0 auto;">
    
    <!-- TOP HEADER BAR -->
    <tr>
      <td style="background-color: #08101a; padding: 16px 24px; border-bottom: 1px solid rgba(212,175,55,0.3);">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="left" style="vertical-align: middle;">
              <div style="display: inline-block; border: 1px solid rgba(255,255,255,0.25); background: rgba(5,10,18,0.8); padding: 5px 14px; border-radius: 4px;">
                <div style="font-family: 'Cinzel', 'Playfair Display', Georgia, serif; font-size: 13px; font-weight: 800; letter-spacing: 4px; color: #ffffff;">
                  IMAGICA<span style="color: #f3c467;">✦</span>
                </div>
                <div style="font-size: 7.5px; font-weight: 700; letter-spacing: 3.5px; color: #d4af37; border-top: 1px solid rgba(212,175,55,0.4); padding-top: 2px; text-align: center;">
                  HOLIDAYS
                </div>
              </div>
            </td>
            <td align="right" style="vertical-align: middle;">
              <span style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #ffffff; font-weight: 600;">
                <a href="https://imagicaholidays.com/destinations" target="_blank" style="color: #ffffff; text-decoration: none;">STAYS</a>
                <span style="color: rgba(255,255,255,0.3); margin: 0 8px;">|</span>
                <a href="https://imagicaholidays.com/destinations" target="_blank" style="color: #ffffff; text-decoration: none;">PACKAGES</a>
                <span style="color: rgba(255,255,255,0.3); margin: 0 8px;">|</span>
                <a href="https://imagicaholidays.com/testimonials" target="_blank" style="color: #ffffff; text-decoration: none;">EXPERIENCES</a>
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- HERO SECTION WITH FESTIVE EVENING BACKGROUND -->
    <tr>
      <td style="background: #1a100a url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200') center/cover no-repeat; padding: 40px 24px 35px; text-align: left; border-bottom: 2px solid #e7ded0;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: rgba(10, 8, 6, 0.72); border-radius: 10px; padding: 24px;">
          <tr>
            <td style="vertical-align: top;">
              <p style="margin: 0 0 6px; font-size: 11px; font-weight: 800; letter-spacing: 3px; color: #f3c467; text-transform: uppercase;">
                THIS DIWALI
              </p>
              <h1 style="margin: 0 0 12px; font-family: Georgia, 'Playfair Display', serif; font-size: 30px; line-height: 1.15; color: #ffffff; font-weight: 700;">
                Gift Yourself<br>
                <span style="color: #f3c467;">Extraordinary</span><br>
                Journeys
              </h1>
              <p style="margin: 0 0 20px; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #f5f0e6; text-transform: uppercase; line-height: 1.4;">
                EXCLUSIVE FESTIVE OFFERS ON<br>HANDPICKED DESTINATIONS
              </p>
              <a href="https://api.whatsapp.com/send/?phone=918910759374&text=Hi%21+I%27d+like+to+explore+Diwali+Holiday+Offers+with+Imagica+Holidays.&type=phone_number&app_absent=0" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f5c518 0%, #e5a522 100%); color: #1a1205; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; padding: 12px 24px; border-radius: 30px; text-decoration: none; text-transform: uppercase; box-shadow: 0 6px 18px rgba(229,165,34,0.45);">
                EXPLORE OFFERS &rarr;
              </a>
            </td>
            <td align="right" style="vertical-align: top; width: 140px;">
              <div style="font-family: 'Brush Script MT', 'Great Vibes', cursive; font-size: 27px; color: #f3c467; line-height: 1.1; text-align: center;">
                Travel This<br>Diwali
                <div style="font-size: 24px; margin-top: 6px;">🪔</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- TOP 4-ICON BENEFIT STRIP -->
    <tr>
      <td style="background-color: #faf7f2; padding: 18px 12px; border-bottom: 1px solid #ede3d5;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="text-align: center;">
          <tr>
            <td width="25%" style="border-right: 1px solid #e7ded0; padding: 0 6px;">
              <div style="font-size: 18px; margin-bottom: 4px;">🏷️</div>
              <div style="font-size: 11px; font-weight: 700; color: #2b2723; line-height: 1.3;">Special<br>Diwali Prices</div>
            </td>
            <td width="25%" style="border-right: 1px solid #e7ded0; padding: 0 6px;">
              <div style="font-size: 18px; margin-bottom: 4px;">🛏️</div>
              <div style="font-size: 11px; font-weight: 700; color: #2b2723; line-height: 1.3;">Curated<br>Luxury Stays</div>
            </td>
            <td width="25%" style="border-right: 1px solid #e7ded0; padding: 0 6px;">
              <div style="font-size: 18px; margin-bottom: 4px;">🚗</div>
              <div style="font-size: 11px; font-weight: 700; color: #2b2723; line-height: 1.3;">Comfortable<br>Transfers</div>
            </td>
            <td width="25%" style="padding: 0 6px;">
              <div style="font-size: 18px; margin-bottom: 4px;">🏔️</div>
              <div style="font-size: 11px; font-weight: 700; color: #2b2723; line-height: 1.3;">Unique<br>Local Experiences</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- DIWALI SPECIAL OFFER: MAROON & GOLD BANNER (FLAT ₹3,000 OFF) -->
    <tr>
      <td style="padding: 24px 20px 10px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #2b0409 0%, #450812 50%, #200206 100%); border: 1px solid #7a1524; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(69,8,18,0.35);">
          <tr>
            <!-- Left Diyas & Flowers Image -->
            <td width="36%" style="vertical-align: middle; background: #1a0206 url('https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600') center/cover no-repeat; min-height: 160px;">
              <div style="height: 100%; min-height: 160px; background: rgba(43,4,9,0.25);"></div>
            </td>
            <!-- Right Offer Text -->
            <td width="64%" style="padding: 22px 20px; text-align: right; vertical-align: middle;">
              <div style="font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #e5b352; text-transform: uppercase; margin-bottom: 4px;">
                DIWALI SPECIAL OFFER
              </div>
              <div style="font-family: Georgia, 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #ffffff; line-height: 1.1; margin-bottom: 2px;">
                FLAT ₹3,000 OFF
              </div>
              <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #f3c467; text-transform: uppercase; margin-bottom: 14px;">
                ON ALL PACKAGES
              </div>

              <!-- Coupon Code Pill -->
              <div style="display: inline-block; background: #170205; border: 1px solid #d4af37; border-radius: 6px; overflow: hidden; vertical-align: middle; margin-bottom: 8px;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 6px 10px; font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #ffffff; text-transform: uppercase;">
                      USE CODE
                    </td>
                    <td style="background-color: #f3c467; padding: 6px 12px; font-family: monospace; font-size: 13px; font-weight: 800; color: #1a1205; letter-spacing: 1px;">
                      DIWALI2026
                    </td>
                    <td style="padding: 6px 8px; color: #f3c467; font-size: 12px;">
                      📋
                    </td>
                  </tr>
                </table>
              </div>

              <div style="font-size: 10px; color: #e5b352; font-weight: 600;">
                ✓ Limited Time Offer
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- FEATURED DESTINATIONS HEADING -->
    <tr>
      <td style="padding: 30px 24px 18px; text-align: center;">
        <p style="margin: 0 0 6px; font-size: 10.5px; font-weight: 800; letter-spacing: 2.5px; color: #8a7560; text-transform: uppercase;">
          FEATURED DESTINATIONS
        </p>
        <h2 style="margin: 0 0 8px; font-family: Georgia, 'Playfair Display', serif; font-size: 24px; color: #1c1917; font-weight: 700;">
          Festive Getaways, Handpicked for You
        </h2>
        <p style="margin: 0 auto; font-size: 12.5px; color: #665e55; line-height: 1.5; max-width: 480px;">
          Breathtaking destinations, serene stays, and unforgettable experiences &mdash; at special Diwali prices.
        </p>
      </td>
    </tr>

    <!-- 2x2 DESTINATION CARDS GRID -->
    <tr>
      <td style="padding: 0 20px 24px;">
        
        <!-- ROW 1: Gangtok & Darjeeling -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
          <tr>
            <!-- CARD 1: Gangtok & North Sikkim -->
            <td width="48%" style="vertical-align: top; background: #ffffff; border: 1px solid #e7dfd5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.04);">
              <div style="position: relative; height: 160px; background: #1a202c url('https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=600') center/cover no-repeat;">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); padding: 14px 12px 10px;">
                  <h3 style="margin: 0; font-family: Georgia, serif; font-size: 14px; color: #ffffff; font-weight: 700; line-height: 1.25;">
                    Gangtok &amp;<br>North Sikkim Retreat
                  </h3>
                </div>
              </div>
              <div style="padding: 12px 14px 14px;">
                <div style="font-size: 11px; color: #4a453e; margin-bottom: 6px; line-height: 1.4;">
                  🛏️ Premium Stays
                </div>
                <div style="font-size: 11px; color: #4a453e; margin-bottom: 6px; line-height: 1.4;">
                  🏔️ Lakes, Monasteries &amp; Snow Peaks
                </div>
                <div style="font-size: 11px; color: #4a453e; margin-bottom: 12px; line-height: 1.4;">
                  🚗 Transfers + Sightseeing
                </div>
                <hr style="border: none; border-top: 1px solid #f0e9df; margin: 0 0 10px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align: middle;">
                      <span style="font-size: 10px; color: #8c8275; text-decoration: line-through;">₹18,999</span>
                      <strong style="display: block; font-size: 15px; color: #1a1714; font-weight: 800;">₹14,999*</strong>
                    </td>
                    <td align="right" style="vertical-align: middle;">
                      <a href="https://api.whatsapp.com/send/?phone=918910759374&text=Hi%21+I+want+to+know+more+about+Gangtok+%26+North+Sikkim+Diwali+Package.&type=phone_number&app_absent=0" target="_blank" style="display: inline-block; background-color: #f3c467; color: #1a1205; font-size: 10px; font-weight: 800; padding: 7px 12px; border-radius: 20px; text-decoration: none; white-space: nowrap;">
                        View Package &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>

            <td width="4%">&nbsp;</td>

            <!-- CARD 2: Darjeeling & Pelling Hideaway -->
            <td width="48%" style="vertical-align: top; background: #ffffff; border: 1px solid #e7dfd5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.04);">
              <div style="position: relative; height: 160px; background: #1a202c url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600') center/cover no-repeat;">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); padding: 14px 12px 10px;">
                  <h3 style="margin: 0; font-family: Georgia, serif; font-size: 14px; color: #ffffff; font-weight: 700; line-height: 1.25;">
                    Darjeeling &amp;<br>Pelling Hideaway
                  </h3>
                </div>
              </div>
              <div style="padding: 12px 14px 14px;">
                <div style="font-size: 11px; color: #4a453e; margin-bottom: 6px; line-height: 1.4;">
                  🛏️ Boutique Hotels
                </div>
                <div style="font-size: 11px; color: #4a453e; margin-bottom: 6px; line-height: 1.4;">
                  🏔️ Tea Gardens &amp; Kanchenjunga Views
                </div>
                <div style="font-size: 11px; color: #4a453e; margin-bottom: 12px; line-height: 1.4;">
                  🚗 Transfers + Experiences
                </div>
                <hr style="border: none; border-top: 1px solid #f0e9df; margin: 0 0 10px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align: middle;">
                      <span style="font-size: 10px; color: #8c8275; text-decoration: line-through;">₹14,999</span>
                      <strong style="display: block; font-size: 15px; color: #1a1714; font-weight: 800;">₹10,499*</strong>
                    </td>
                    <td align="right" style="vertical-align: middle;">
                      <a href="https://api.whatsapp.com/send/?phone=918910759374&text=Hi%21+I+want+to+know+more+about+Darjeeling+%26+Pelling+Diwali+Package.&type=phone_number&app_absent=0" target="_blank" style="display: inline-block; background-color: #f3c467; color: #1a1205; font-size: 10px; font-weight: 800; padding: 7px 12px; border-radius: 20px; text-decoration: none; white-space: nowrap;">
                        View Package &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>

        <!-- ROW 2: Kerala & Andaman -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <!-- CARD 3: Kerala Houseboat & Munnar Hills -->
            <td width="48%" style="vertical-align: top; background: #ffffff; border: 1px solid #e7dfd5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.04);">
              <div style="position: relative; height: 160px; background: #1a202c url('https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600') center/cover no-repeat;">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); padding: 14px 12px 10px;">
                  <h3 style="margin: 0; font-family: Georgia, serif; font-size: 14px; color: #ffffff; font-weight: 700; line-height: 1.25;">
                    Kerala Houseboat<br>&amp; Munnar Hills
                  </h3>
                </div>
              </div>
              <div style="padding: 12px 14px 14px;">
                <div style="font-size: 11px; color: #4a453e; margin-bottom: 6px; line-height: 1.4;">
                  🛏️ Luxury Houseboat + Resort
                </div>
                <div style="font-size: 11px; color: #4a453e; margin-bottom: 6px; line-height: 1.4;">
                  🏔️ Tea Plantations &amp; Waterfalls
                </div>
                <div style="font-size: 11px; color: #4a453e; margin-bottom: 12px; line-height: 1.4;">
                  🚗 Transfers + Sightseeing
                </div>
                <hr style="border: none; border-top: 1px solid #f0e9df; margin: 0 0 10px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align: middle;">
                      <span style="font-size: 10px; color: #8c8275; text-decoration: line-through;">₹22,999</span>
                      <strong style="display: block; font-size: 15px; color: #1a1714; font-weight: 800;">₹17,499*</strong>
                    </td>
                    <td align="right" style="vertical-align: middle;">
                      <a href="https://api.whatsapp.com/send/?phone=918910759374&text=Hi%21+I+want+to+know+more+about+Kerala+Houseboat+%26+Munnar+Diwali+Package.&type=phone_number&app_absent=0" target="_blank" style="display: inline-block; background-color: #f3c467; color: #1a1205; font-size: 10px; font-weight: 800; padding: 7px 12px; border-radius: 20px; text-decoration: none; white-space: nowrap;">
                        View Package &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>

            <td width="4%">&nbsp;</td>

            <!-- CARD 4: Andaman & Havelock Escape -->
            <td width="48%" style="vertical-align: top; background: #ffffff; border: 1px solid #e7dfd5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.04);">
              <div style="position: relative; height: 160px; background: #1a202c url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600') center/cover no-repeat;">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); padding: 14px 12px 10px;">
                  <h3 style="margin: 0; font-family: Georgia, serif; font-size: 14px; color: #ffffff; font-weight: 700; line-height: 1.25;">
                    Andaman &amp;<br>Havelock Escape
                  </h3>
                </div>
              </div>
              <div style="padding: 12px 14px 14px;">
                <div style="font-size: 11px; color: #4a453e; margin-bottom: 6px; line-height: 1.4;">
                  🛏️ Beach Resorts
                </div>
                <div style="font-size: 11px; color: #4a453e; margin-bottom: 6px; line-height: 1.4;">
                  🏔️ Crystal Clear Waters &amp; Islands
                </div>
                <div style="font-size: 11px; color: #4a453e; margin-bottom: 12px; line-height: 1.4;">
                  🚗 Transfers + Activities
                </div>
                <hr style="border: none; border-top: 1px solid #f0e9df; margin: 0 0 10px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align: middle;">
                      <span style="font-size: 10px; color: #8c8275; text-decoration: line-through;">₹26,999</span>
                      <strong style="display: block; font-size: 15px; color: #1a1714; font-weight: 800;">₹19,999*</strong>
                    </td>
                    <td align="right" style="vertical-align: middle;">
                      <a href="https://api.whatsapp.com/send/?phone=918910759374&text=Hi%21+I+want+to+know+more+about+Andaman+%26+Havelock+Diwali+Package.&type=phone_number&app_absent=0" target="_blank" style="display: inline-block; background-color: #f3c467; color: #1a1205; font-size: 10px; font-weight: 800; padding: 7px 12px; border-radius: 20px; text-decoration: none; white-space: nowrap;">
                        View Package &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- BOTTOM 4-ICON TRUST STRIP -->
    <tr>
      <td style="background-color: #faf7f2; padding: 18px 12px; border-top: 1px solid #ede3d5; border-bottom: 1px solid #ede3d5;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="text-align: center;">
          <tr>
            <td width="25%" style="border-right: 1px solid #e7ded0; padding: 0 6px;">
              <div style="font-size: 18px; margin-bottom: 4px;">💎</div>
              <div style="font-size: 11px; font-weight: 700; color: #2b2723; line-height: 1.3;">Handpicked<br>Stays</div>
            </td>
            <td width="25%" style="border-right: 1px solid #e7ded0; padding: 0 6px;">
              <div style="font-size: 18px; margin-bottom: 4px;">🪷</div>
              <div style="font-size: 11px; font-weight: 700; color: #2b2723; line-height: 1.3;">Authentic<br>Local Experiences</div>
            </td>
            <td width="25%" style="border-right: 1px solid #e7ded0; padding: 0 6px;">
              <div style="font-size: 18px; margin-bottom: 4px;">🛡️</div>
              <div style="font-size: 11px; font-weight: 700; color: #2b2723; line-height: 1.3;">Safe &amp; Reliable<br>Travel</div>
            </td>
            <td width="25%" style="padding: 0 6px;">
              <div style="font-size: 18px; margin-bottom: 4px;">🎧</div>
              <div style="font-size: 11px; font-weight: 700; color: #2b2723; line-height: 1.3;">24/7 Travel<br>Support</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- PRE-FOOTER CTA WITH GOLDEN SUNSET VISTA -->
    <tr>
      <td style="background: #2a1608 url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200') center/cover no-repeat; padding: 36px 20px; text-align: center;">
        <div style="background: rgba(18, 10, 5, 0.72); border-radius: 12px; padding: 22px 16px; display: inline-block; max-width: 520px; width: 100%;">
          <p style="margin: 0 0 14px; font-size: 11px; font-weight: 800; letter-spacing: 2.5px; color: #f3c467; text-transform: uppercase;">
            READY TO PLAN YOUR FESTIVE ESCAPE?
          </p>
          <a href="https://api.whatsapp.com/send/?phone=918910759374&text=Hi%21+I%27d+like+to+plan+a+trip+with+Imagica+Holidays.&type=phone_number&app_absent=0" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f5c518 0%, #e5a522 100%); color: #1a1205; font-size: 13.5px; font-weight: 800; padding: 13px 26px; border-radius: 35px; text-decoration: none; box-shadow: 0 6px 20px rgba(229,165,34,0.45); line-height: 1.2;">
            💬 Chat with Travel Concierge (+91 89107 59374) &rarr;
          </a>
        </div>
      </td>
    </tr>

    <!-- FOOTER SECTION -->
    <tr>
      <td style="background-color: #08101a; padding: 28px 24px 20px; border-top: 1px solid rgba(212,175,55,0.4);">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 18px;">
          <tr>
            <!-- Left Logo -->
            <td width="30%" align="left" style="vertical-align: middle;">
              <div style="display: inline-block; border: 1px solid rgba(255,255,255,0.2); background: rgba(5,10,18,0.7); padding: 5px 12px; border-radius: 4px;">
                <div style="font-family: 'Cinzel', 'Playfair Display', Georgia, serif; font-size: 12px; font-weight: 800; letter-spacing: 3px; color: #ffffff;">
                  IMAGICA<span style="color: #f3c467;">✦</span>
                </div>
                <div style="font-size: 7px; font-weight: 700; letter-spacing: 3px; color: #d4af37; border-top: 1px solid rgba(212,175,55,0.4); padding-top: 2px; text-align: center;">
                  HOLIDAYS
                </div>
              </div>
            </td>
            <!-- Middle Links -->
            <td width="50%" align="center" style="vertical-align: middle; font-size: 11px; color: #c4b8a5; line-height: 1.6;">
              <a href="mailto:info@imagicaholidays.com" style="color: #c4b8a5; text-decoration: none;">✉️ info@imagicaholidays.com</a><br>
              <a href="tel:+918910759374" style="color: #c4b8a5; text-decoration: none;">📞 +91 89107 59374</a><br>
              <span style="color: #94a3b8; font-size: 10px;">📍 Kolkata, West Bengal</span><br>
              <a href="https://imagicaholidays.com" target="_blank" style="color: #f3c467; text-decoration: none; font-weight: 600;">🌐 www.imagicaholidays.com</a>
            </td>
            <!-- Right Social Icons -->
            <td width="20%" align="right" style="vertical-align: middle;">
              <span style="font-size: 16px; letter-spacing: 6px;">
                <a href="https://instagram.com" target="_blank" style="text-decoration: none; color: #d4af37;">📷</a>
                <a href="https://facebook.com" target="_blank" style="text-decoration: none; color: #d4af37;">📘</a>
                <a href="https://youtube.com" target="_blank" style="text-decoration: none; color: #d4af37;">▶️</a>
              </span>
            </td>
          </tr>
        </table>

        <!-- Disclaimer & T&C -->
        <div style="border-top: 1px solid #1a2533; padding-top: 14px; text-align: center; font-size: 10px; color: #6e7e91; line-height: 1.5;">
          You are receiving this email because you are a valued customer of Imagica Holidays.<br>
          Offers are subject to availability. Prices may vary based on travel dates, number of travellers and inclusions. T&amp;C apply.
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
        setAttachment({
          url: res.data.data.url,
          filename: res.data.data.filename || file.name,
          size: file.size,
        });
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
                        <Label className="text-xs font-medium">Email Message Body (HTML supported)</Label>
                        <Textarea
                          rows={6}
                          value={emailContent}
                          onChange={e => setEmailContent(e.target.value)}
                          className="text-xs font-mono"
                        />
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
                    {/* Header Document Preview */}
                    {attachment && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded p-2 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                        <div className="truncate text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
                          {attachment.filename}
                        </div>
                      </div>
                    )}

                    <div className="text-zinc-800 dark:text-zinc-100 text-xs leading-relaxed">
                      Hello <strong>{'{{Customer Name}}'}</strong>, ✨
                      <br /><br />
                      Celebrate this season with <strong>Imagica Holidays</strong>!
                      <br /><br />
                      🎁 {offerText}
                      <br /><br />
                      Use Promo Code: <strong className="text-emerald-600">{promoCode}</strong>
                      <br /><br />
                      {attachment && '📄 Please find our special travel catalog attached above.'}
                    </div>

                    <div className="pt-2 border-t space-y-1.5">
                      <a
                        href={conciergeWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-[#25D366] hover:bg-[#20bd5a] text-white text-center py-2 px-3 rounded text-[11px] font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer no-underline"
                        title={`Click to test opening WhatsApp chat to +${conciergePhone}`}
                      >
                        <span>💬 Chat with Travel Concierge</span>
                        <ExternalLink className="h-3 w-3 opacity-90 group-hover:opacity-100" />
                      </a>
                      <div className="text-[10px] text-center text-emerald-800 dark:text-emerald-300 font-medium flex items-center justify-center gap-1">
                        <span>👉 Opens chat with:</span>
                        <code className="bg-emerald-100 dark:bg-emerald-950 px-1 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-900 dark:text-emerald-200">
                          +{conciergePhone}
                        </code>
                      </div>
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
