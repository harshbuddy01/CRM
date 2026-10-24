import { redirect } from 'next/navigation';

export default function EmailCampaignRedirect() {
  redirect('/marketing/broadcast');
}
