import React from 'react';
import { Info, Plug } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useHomeCountry } from '@/hooks/useHomeCountry';
import { cca2ToIso3 } from '@/utils/countryIso3';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';
import { InsightLine } from '@/components/InsightLine';
import { useInsights } from '@/contexts/InsightsContext';

interface PowerAdaptorWidgetProps {
  placeDetails: SelectedPlace | null;
  animationDelay?: string;
}

interface PowerProfile {
  plugTypes: string[];
  voltage: number;
  frequency: number;
}

// ISO2 → power profile (covers ~200 countries)
const POWER_DATA: Record<string, PowerProfile> = {
  US: { plugTypes: ['A', 'B'], voltage: 120, frequency: 60 },
  CA: { plugTypes: ['A', 'B'], voltage: 120, frequency: 60 },
  MX: { plugTypes: ['A', 'B'], voltage: 127, frequency: 60 },
  GB: { plugTypes: ['G'], voltage: 230, frequency: 50 },
  IE: { plugTypes: ['G'], voltage: 230, frequency: 50 },
  FR: { plugTypes: ['C', 'E'], voltage: 230, frequency: 50 },
  DE: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  ES: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  IT: { plugTypes: ['C', 'F', 'L'], voltage: 230, frequency: 50 },
  PT: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  NL: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  BE: { plugTypes: ['C', 'E'], voltage: 230, frequency: 50 },
  AT: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  CH: { plugTypes: ['C', 'J'], voltage: 230, frequency: 50 },
  SE: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  NO: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  DK: { plugTypes: ['C', 'E', 'F', 'K'], voltage: 230, frequency: 50 },
  FI: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  IS: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  GR: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  PL: { plugTypes: ['C', 'E'], voltage: 230, frequency: 50 },
  CZ: { plugTypes: ['C', 'E'], voltage: 230, frequency: 50 },
  HU: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  RO: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  BG: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  HR: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  SI: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  SK: { plugTypes: ['C', 'E'], voltage: 230, frequency: 50 },
  RS: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  BA: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  ME: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  MK: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  AL: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  LT: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  LV: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  EE: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  LU: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  MT: { plugTypes: ['G'], voltage: 230, frequency: 50 },
  CY: { plugTypes: ['G'], voltage: 230, frequency: 50 },
  RU: { plugTypes: ['C', 'F'], voltage: 220, frequency: 50 },
  UA: { plugTypes: ['C', 'F'], voltage: 220, frequency: 50 },
  TR: { plugTypes: ['C', 'F'], voltage: 220, frequency: 50 },
  JP: { plugTypes: ['A', 'B'], voltage: 100, frequency: 50 },
  CN: { plugTypes: ['A', 'C', 'I'], voltage: 220, frequency: 50 },
  KR: { plugTypes: ['C', 'F'], voltage: 220, frequency: 60 },
  IN: { plugTypes: ['C', 'D', 'M'], voltage: 230, frequency: 50 },
  TH: { plugTypes: ['A', 'B', 'C', 'O'], voltage: 220, frequency: 50 },
  VN: { plugTypes: ['A', 'C'], voltage: 220, frequency: 50 },
  SG: { plugTypes: ['G'], voltage: 230, frequency: 50 },
  MY: { plugTypes: ['G'], voltage: 240, frequency: 50 },
  ID: { plugTypes: ['C', 'F'], voltage: 230, frequency: 50 },
  PH: { plugTypes: ['A', 'B', 'C'], voltage: 220, frequency: 60 },
  KH: { plugTypes: ['A', 'C', 'G'], voltage: 230, frequency: 50 },
  MM: { plugTypes: ['C', 'D', 'F', 'G'], voltage: 230, frequency: 50 },
  LA: { plugTypes: ['A', 'B', 'C', 'E', 'F'], voltage: 230, frequency: 50 },
  NP: { plugTypes: ['C', 'D', 'M'], voltage: 230, frequency: 50 },
  LK: { plugTypes: ['D', 'G', 'M'], voltage: 230, frequency: 50 },
  MV: { plugTypes: ['A', 'D', 'G', 'J', 'K', 'L'], voltage: 230, frequency: 50 },
  PK: { plugTypes: ['C', 'D'], voltage: 230, frequency: 50 },
  BD: { plugTypes: ['A', 'C', 'D', 'G', 'K'], voltage: 220, frequency: 50 },
  TW: { plugTypes: ['A', 'B'], voltage: 110, frequency: 60 },
  HK: { plugTypes: ['G'], voltage: 220, frequency: 50 },
  MO: { plugTypes: ['D', 'G'], voltage: 220, frequency: 50 },
  AU: { plugTypes: ['I'], voltage: 230, frequency: 50 },
  NZ: { plugTypes: ['I'], voltage: 230, frequency: 50 },
  FJ: { plugTypes: ['I'], voltage: 240, frequency: 50 },
  ZA: { plugTypes: ['C', 'D', 'M', 'N'], voltage: 230, frequency: 50 },
  EG: { plugTypes: ['C', 'F'], voltage: 220, frequency: 50 },
  NG: { plugTypes: ['D', 'G'], voltage: 240, frequency: 50 },
  KE: { plugTypes: ['G'], voltage: 240, frequency: 50 },
  TZ: { plugTypes: ['D', 'G'], voltage: 230, frequency: 50 },
  UG: { plugTypes: ['G'], voltage: 240, frequency: 50 },
  RW: { plugTypes: ['C', 'J'], voltage: 230, frequency: 50 },
  GH: { plugTypes: ['D', 'G'], voltage: 230, frequency: 50 },
  SN: { plugTypes: ['C', 'D', 'E', 'K'], voltage: 230, frequency: 50 },
  MA: { plugTypes: ['C', 'E'], voltage: 220, frequency: 50 },
  ET: { plugTypes: ['C', 'E', 'F', 'L'], voltage: 220, frequency: 50 },
  BR: { plugTypes: ['C', 'N'], voltage: 127, frequency: 60 },
  AR: { plugTypes: ['C', 'I'], voltage: 220, frequency: 50 },
  CL: { plugTypes: ['C', 'L'], voltage: 220, frequency: 50 },
  CO: { plugTypes: ['A', 'B'], voltage: 110, frequency: 60 },
  PE: { plugTypes: ['A', 'B', 'C'], voltage: 220, frequency: 60 },
  VE: { plugTypes: ['A', 'B'], voltage: 120, frequency: 60 },
  EC: { plugTypes: ['A', 'B'], voltage: 120, frequency: 60 },
  UY: { plugTypes: ['C', 'F', 'I', 'L'], voltage: 220, frequency: 50 },
  PY: { plugTypes: ['C'], voltage: 220, frequency: 50 },
  BO: { plugTypes: ['A', 'C'], voltage: 230, frequency: 50 },
  CR: { plugTypes: ['A', 'B'], voltage: 120, frequency: 60 },
  PA: { plugTypes: ['A', 'B'], voltage: 120, frequency: 60 },
  CU: { plugTypes: ['A', 'B', 'C', 'L'], voltage: 110, frequency: 60 },
  JM: { plugTypes: ['A', 'B'], voltage: 110, frequency: 50 },
  DO: { plugTypes: ['A', 'B'], voltage: 120, frequency: 60 },
  GT: { plugTypes: ['A', 'B'], voltage: 120, frequency: 60 },
  HN: { plugTypes: ['A', 'B'], voltage: 110, frequency: 60 },
  SV: { plugTypes: ['A', 'B'], voltage: 115, frequency: 60 },
  NI: { plugTypes: ['A', 'B'], voltage: 120, frequency: 60 },
  AE: { plugTypes: ['C', 'D', 'G'], voltage: 220, frequency: 50 },
  SA: { plugTypes: ['A', 'B', 'G'], voltage: 220, frequency: 60 },
  QA: { plugTypes: ['D', 'G'], voltage: 240, frequency: 50 },
  KW: { plugTypes: ['C', 'G'], voltage: 240, frequency: 50 },
  OM: { plugTypes: ['C', 'G'], voltage: 240, frequency: 50 },
  BH: { plugTypes: ['G'], voltage: 230, frequency: 50 },
  JO: { plugTypes: ['B', 'C', 'D', 'F', 'G', 'J'], voltage: 230, frequency: 50 },
  LB: { plugTypes: ['A', 'B', 'C', 'D', 'G'], voltage: 220, frequency: 50 },
  IL: { plugTypes: ['C', 'H', 'M'], voltage: 230, frequency: 50 },
  IQ: { plugTypes: ['C', 'D', 'G'], voltage: 230, frequency: 50 },
  IR: { plugTypes: ['C', 'F'], voltage: 220, frequency: 50 },
};

function getDestPower(cc2: string | undefined): PowerProfile | null {
  if (!cc2) return null;
  return POWER_DATA[cc2.toUpperCase()] || null;
}

function needsAdaptor(homeCc2: string | undefined, destCc2: string | undefined): boolean | null {
  if (!homeCc2 || !destCc2) return null;
  const home = POWER_DATA[homeCc2.toUpperCase()];
  const dest = POWER_DATA[destCc2.toUpperCase()];
  if (!home || !dest) return null;
  const overlap = home.plugTypes.some(t => dest.plugTypes.includes(t));
  return !overlap;
}

function iso3ToCc2(iso3: string): string | null {
  // Reverse lookup — find the cc2 that maps to this iso3
  const entries: [string, string][] = [
    ['AF','AFG'],['AL','ALB'],['DZ','DZA'],['AD','AND'],['AO','AGO'],['AG','ATG'],['AR','ARG'],['AM','ARM'],
    ['AU','AUS'],['AT','AUT'],['AZ','AZE'],['BS','BHS'],['BH','BHR'],['BD','BGD'],['BB','BRB'],['BY','BLR'],
    ['BE','BEL'],['BZ','BLZ'],['BJ','BEN'],['BT','BTN'],['BO','BOL'],['BA','BIH'],['BW','BWA'],['BR','BRA'],
    ['BN','BRN'],['BG','BGR'],['BF','BFA'],['BI','BDI'],['KH','KHM'],['CM','CMR'],['CA','CAN'],['CV','CPV'],
    ['CF','CAF'],['TD','TCD'],['CL','CHL'],['CN','CHN'],['CO','COL'],['KM','COM'],['CG','COG'],['CD','COD'],
    ['CR','CRI'],['HR','HRV'],['CU','CUB'],['CY','CYP'],['CZ','CZE'],['DK','DNK'],['DJ','DJI'],['DM','DMA'],
    ['DO','DOM'],['EC','ECU'],['EG','EGY'],['SV','SLV'],['GQ','GNQ'],['ER','ERI'],['EE','EST'],['SZ','SWZ'],
    ['ET','ETH'],['FJ','FJI'],['FI','FIN'],['FR','FRA'],['GA','GAB'],['GM','GMB'],['GE','GEO'],['DE','DEU'],
    ['GH','GHA'],['GR','GRC'],['GD','GRD'],['GT','GTM'],['GN','GIN'],['GW','GNB'],['GY','GUY'],['HT','HTI'],
    ['HN','HND'],['HU','HUN'],['IS','ISL'],['IN','IND'],['ID','IDN'],['IR','IRN'],['IQ','IRQ'],['IE','IRL'],
    ['IL','ISR'],['IT','ITA'],['CI','CIV'],['JM','JAM'],['JP','JPN'],['JO','JOR'],['KZ','KAZ'],['KE','KEN'],
    ['KI','KIR'],['KP','PRK'],['KR','KOR'],['KW','KWT'],['KG','KGZ'],['LA','LAO'],['LV','LVA'],['LB','LBN'],
    ['LS','LSO'],['LR','LBR'],['LY','LBY'],['LI','LIE'],['LT','LTU'],['LU','LUX'],['MG','MDG'],['MW','MWI'],
    ['MY','MYS'],['MV','MDV'],['ML','MLI'],['MT','MLT'],['MH','MHL'],['MR','MRT'],['MU','MUS'],['MX','MEX'],
    ['FM','FSM'],['MD','MDA'],['MC','MCO'],['MN','MNG'],['ME','MNE'],['MA','MAR'],['MZ','MOZ'],['MM','MMR'],
    ['NA','NAM'],['NR','NRU'],['NP','NPL'],['NL','NLD'],['NZ','NZL'],['NI','NIC'],['NE','NER'],['NG','NGA'],
    ['MK','MKD'],['NO','NOR'],['OM','OMN'],['PK','PAK'],['PW','PLW'],['PA','PAN'],['PG','PNG'],['PY','PRY'],
    ['PE','PER'],['PH','PHL'],['PL','POL'],['PT','PRT'],['QA','QAT'],['RO','ROU'],['RU','RUS'],['RW','RWA'],
    ['KN','KNA'],['LC','LCA'],['VC','VCT'],['WS','WSM'],['SM','SMR'],['ST','STP'],['SA','SAU'],['SN','SEN'],
    ['RS','SRB'],['SC','SYC'],['SL','SLE'],['SG','SGP'],['SK','SVK'],['SI','SVN'],['SB','SLB'],['SO','SOM'],
    ['ZA','ZAF'],['SS','SSD'],['ES','ESP'],['LK','LKA'],['SD','SDN'],['SR','SUR'],['SE','SWE'],['CH','CHE'],
    ['SY','SYR'],['TW','TWN'],['TJ','TJK'],['TZ','TZA'],['TH','THA'],['TL','TLS'],['TG','TGO'],['TO','TON'],
    ['TT','TTO'],['TN','TUN'],['TR','TUR'],['TM','TKM'],['TV','TUV'],['UG','UGA'],['UA','UKR'],['AE','ARE'],
    ['GB','GBR'],['US','USA'],['UY','URY'],['UZ','UZB'],['VU','VUT'],['VE','VEN'],['VN','VNM'],['YE','YEM'],
    ['ZM','ZMB'],['ZW','ZWE'],['HK','HKG'],['MO','MAC'],['PS','PSE'],['XK','XKX'],
  ];
  const upper = iso3.toUpperCase();
  for (const [cc2, cc3] of entries) {
    if (cc3 === upper) return cc2;
  }
  return null;
}

const PowerAdaptorWidget: React.FC<PowerAdaptorWidgetProps> = ({
  placeDetails,
  animationDelay = '0.2s',
}) => {
  const { insights, loading: insightsLoading } = useInsights();
  const destCc2 = placeDetails?.country_code?.toUpperCase() || null;
  const power = getDestPower(destCc2 ?? undefined);

  const { homeCountry } = useHomeCountry();
  const homeCc2 = homeCountry ? iso3ToCc2(homeCountry.iso3) : null;
  const adaptor = needsAdaptor(homeCc2 ?? undefined, destCc2 ?? undefined);

  return (
    <div
      className="widget-card animate-slide-up"
      style={{ animationDelay }}
    >
      {/* Header */}
      <div className="widget-header">
        <div className="widget-icon bg-amber-500/10 text-amber-600">
          <Plug className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="widget-title">Power Adaptor</h3>
          <p className="widget-subtitle">Plug type & voltage</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors rounded-full p-1 -mr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="What this means"
            >
              <Info className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 text-sm">
            <p className="text-foreground leading-relaxed">
              Electrical outlet standards at your destination. Plug types indicate the physical shape of the outlet.
              Voltage and frequency affect whether your devices will work without a converter.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      {/* Main content */}
      <div className="mt-1" />
      {!power ? (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Data unavailable</p>
          {destCc2 && (
            <p className="text-xs text-muted-foreground/[0.62]">
              No data for {destCc2}
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {/* Adaptor illustration */}
          <svg className="shrink-0 animate-slow-turn" width="72" height="88" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="adpt-body" x1="16" y1="24" x2="56" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#e8e8e8" />
                <stop offset="0.5" stopColor="#d4d4d4" />
                <stop offset="1" stopColor="#b0b0b0" />
              </linearGradient>
              <linearGradient id="adpt-top" x1="20" y1="18" x2="52" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#f5f5f5" />
                <stop offset="1" stopColor="#dcdcdc" />
              </linearGradient>
              <linearGradient id="adpt-pin" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#c0c0c0" />
                <stop offset="0.4" stopColor="#e8e8e8" />
                <stop offset="1" stopColor="#999" />
              </linearGradient>
              <filter id="adpt-shadow" x="-4" y="2" width="80" height="92" filterUnits="userSpaceOnUse">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.12" />
              </filter>
            </defs>
            <g filter="url(#adpt-shadow)">
              <rect x="14" y="24" width="44" height="52" rx="6" fill="url(#adpt-body)" />
              <rect x="14" y="24" width="3" height="52" rx="1.5" fill="#f0f0f0" opacity="0.5" />
              <rect x="55" y="24" width="3" height="52" rx="1.5" fill="#999" opacity="0.2" />
              <rect x="16" y="22" width="40" height="8" rx="3" fill="url(#adpt-top)" />
              <rect x="16" y="72" width="40" height="3" rx="1.5" fill="#a0a0a0" />
              <rect x="26" y="38" width="3" height="14" rx="1.5" fill="#555" />
              <rect x="43" y="38" width="3" height="14" rx="1.5" fill="#555" />
              <circle cx="36" cy="60" r="2.5" fill="#555" />
              <rect x="28" y="6" width="3" height="18" rx="1" fill="url(#adpt-pin)" />
              <rect x="41" y="6" width="3" height="18" rx="1" fill="url(#adpt-pin)" />
              <rect x="20" y="32" width="32" height="38" rx="3" stroke="#bbb" strokeWidth="0.5" fill="none" />
            </g>
          </svg>
          {/* Text */}
          <div className="space-y-1.5">
            <p className="widget-value text-foreground" style={{ letterSpacing: '-0.03em' }}>
              Type {power.plugTypes.join(', ')}
            </p>
            <p className="text-xs text-muted-foreground">
              {power.voltage}V / {power.frequency}Hz
            </p>
            {adaptor !== null && (
              <p className="text-xs text-muted-foreground">
                {adaptor
                  ? `Adaptor needed from ${homeCountry!.name}`
                  : `Compatible with ${homeCountry!.name} plugs`}
              </p>
            )}
          </div>
        </div>
      )}
      <InsightLine insight={insights?.powerAdapter} loading={insightsLoading} />
    </div>
  );
};

export default PowerAdaptorWidget;
