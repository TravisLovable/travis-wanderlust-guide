import React from 'react';
import { Plug, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTravelContext } from '@/contexts/TravelContext';
import { SelectedPlace } from '@/hooks/useMapboxGeocoding';

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

const TOTAL_ROWS = 3;

const PowerAdaptorWidget: React.FC<PowerAdaptorWidgetProps> = ({
  placeDetails,
  animationDelay = '0.2s',
}) => {
  const destCc2 = placeDetails?.country_code?.toUpperCase() || null;
  const power = getDestPower(destCc2 ?? undefined);

  const { resolvedBaselineCountry } = useTravelContext();
  const homeCc2 = resolvedBaselineCountry?.code ?? null;
  const adaptor = needsAdaptor(homeCc2 ?? undefined, destCc2 ?? undefined);

  const needed = adaptor === true;
  const statusText = adaptor === null
    ? 'Compatibility unknown'
    : needed
      ? 'Adapter needed'
      : 'No adapter needed';

  const rows: { label: string; value: string }[] = power
    ? [
        { label: 'Plug type', value: `Type ${power.plugTypes.join(', ')}` },
        { label: 'Voltage', value: `${power.voltage}V` },
        { label: 'Frequency', value: `${power.frequency}Hz` },
      ]
    : [];

  return (
    <div className="widget-card animate-slide-up" style={{ animationDelay }}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="widget-icon bg-amber-500/10 text-amber-600">
          <Plug className="w-5 h-5" />
        </div>
        <div>
          <h3 className="widget-title">Power Adaptor</h3>
          <p className="widget-subtitle">Plug type &amp; voltage</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col mt-4 overflow-hidden">

        {/* Primary status */}
        <div className="flex items-center gap-2 mb-3">
          {needed ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          )}
          <span className="text-[14px] font-medium text-foreground truncate">
            {statusText}
          </span>
        </div>

        {/* Supporting rows */}
        <div className="flex-1 min-h-0 space-y-1.5">
          {Array.from({ length: TOTAL_ROWS }).map((_, i) => {
            const row = rows[i];
            return (
              <div key={i} className="min-w-0">
                {row ? (
                  <p className="text-[12px] text-muted-foreground/75 whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className="text-muted-foreground/40 font-medium">{row.label}:</span>{' '}
                    {row.value}
                  </p>
                ) : (
                  <div className="h-[18px]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PowerAdaptorWidget;
