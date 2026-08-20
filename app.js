document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    // ── Progress Bar helpers ──────────────────────────────────────────────────
    const progressFill = document.getElementById('progressFill');
    const progressLabel = document.getElementById('progressLabel');

    function updateProgress() {
        const boxes = document.querySelectorAll('#quality .check-box');
        const checked = document.querySelectorAll('#quality .check-box.checked').length;
        const total = boxes.length;
        const pct = total ? (checked / total) * 100 : 0;
        if (progressFill) progressFill.style.width = pct + '%';
        if (progressLabel) progressLabel.textContent = `${checked} / ${total} completed`;
    }

    // Delegated check-box click for the quality view
    document.getElementById('quality').addEventListener('click', (e) => {
        const box = e.target.closest('.check-box');
        if (box) {
            box.classList.toggle('checked');
            updateProgress();
        }
    });

    // Initial count once DOM is ready
    updateProgress();

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetViewId = item.getAttribute('data-view');

            // Update Nav
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Update View
            views.forEach(v => {
                v.classList.remove('active');
                if (v.id === targetViewId) {
                    v.classList.add('active');
                }
            });
        });
    });

    // BMS Detailed Guides Data
    const bmsData = {
        honeywell: {
            title: "Honeywell EBI Export Guide",
            steps: [
                "Open Station and navigate to the 'Reports' or 'Trend' display.",
                "Select 'Trend Export' from the configuration menu.",
                "Choose the required points (Chiller, Pumps, etc.).",
                "Set the export interval to 5 or 15 minutes.",
                "Select 'CSV' as the output format and UTF-8 encoding.",
                "Save the file with building name and current date."
            ]
        },
        siemens: {
            title: "Siemens Desigo CC Export Guide",
            steps: [
                "Navigate to the 'Information Manager' or 'Trend' application.",
                "Locate the Data Loggers for the target equipment.",
                "Select 'Export' from the context menu.",
                "Choose 'CSV' format and ensure 'Long' timestamp format is selected.",
                "Verify the date range covers the last 12-18 months.",
                "Export and verify the column headers are clear."
            ]
        },
        jci: {
            title: "Johnson Controls Metasys Export Guide",
            steps: [
                "Log into the Metasys Site Management Portal (SMP).",
                "Use the 'Trend Study' tool to select your points.",
                "Define the time range for historical data (last 12 months minimum).",
                "Click 'Export' and select 'Comma Separated Values' (CSV).",
                "Ensure date/time formatting is consistent (YYYY-MM-DD HH:MM).",
                "Download the generated file."
            ]
        },
        schneider: {
            title: "Schneider EcoStruxure Export Guide",
            steps: [
                "Access the 'WebStation' or 'WorkStation'.",
                "Navigate to 'Trend Logs' under the required controllers.",
                "Use the 'Export Log' feature.",
                "Select 'CSV' format and period: 'Last Year'.",
                "Check 'UTF-8' for encoding options if available.",
                "Validate data columns before final submission."
            ]
        }
    };

    // Modal Logic
    const modal = document.getElementById('bmsModal');
    const modalBody = document.getElementById('modalBody');
    const bmsCards = document.querySelectorAll('.bms-card');
    const closeModal = document.querySelector('.close-modal');

    // ── Shared modal opener ──────────────────────────────────────────────────
    function openModal(html) {
        modalBody.innerHTML = html;
        modal.style.display = 'block';
    }

    // ── BMS Detailed Guides ──────────────────────────────────────────────────
    bmsCards.forEach(card => {
        card.addEventListener('click', () => {
            const data = bmsData[card.getAttribute('data-bms')];
            openModal(`
                <h2 class="accent-text">${data.title}</h2>
                <ol>${data.steps.map(s => `<li>${s}</li>`).join('')}</ol>
                <div class="modal-footer">Need help? Contact support@retragreen.com</div>
            `);
        });
    });

    // ── Information Section Detailed Content ─────────────────────────────────
    const infoData = {
        project: {
            title: "Project Details — Required Information",
            sections: [
                {
                    heading: "Site Identification",
                    items: [
                        "Site / Building Name",
                        "Full Address (Street, City, State/Province, Country)",
                        "Building Type (Office / Retail / Industrial / Hospital / Other)",
                        "Total Gross Floor Area (m² or ft²)",
                        "Number of Floors",
                        "Year of Construction"
                    ]
                },
                {
                    heading: "Primary Contact",
                    items: [
                        "Contact Name & Title",
                        "Email Address",
                        "Phone Number",
                        "WeChat / Preferred Communication Channel",
                        "BMS / Facilities Manager Contact (if different)"
                    ]
                },
                {
                    heading: "Operational Profile",
                    items: [
                        "Operating Hours (e.g., Mon-Fri 08:00-18:00)",
                        "HVAC System Operating Season (year-round / seasonal)",
                        "Known System Changes or Maintenance Events in the Last 2 Years"
                    ]
                }
            ]
        },
        equipment: {
            title: "Equipment Inventory — Required Information",
            sections: [
                {
                    heading: "Chillers",
                    items: [
                        "Number of chillers on site",
                        "Make, model, and year for each unit",
                        "Rated cooling capacity (kW / RT)",
                        "Refrigerant type (R-134a, R-410A, etc.)",
                        "Type: Air-cooled / Water-cooled"
                    ]
                },
                {
                    heading: "Pumps",
                    items: [
                        "Chilled Water Pumps: quantity, rated flow (m³/h), rated power (kW)",
                        "Condenser Water Pumps: quantity, rated flow, power",
                        "Variable Speed Drive (VSD) fitted? Yes / No",
                        "Primary-Secondary or Variable Primary system?"
                    ]
                },
                {
                    heading: "Cooling Towers",
                    items: [
                        "Number of cooling tower cells",
                        "Rated capacity per cell (kW / RT)",
                        "Fan motor power (kW)",
                        "VSD fitted on fans? Yes / No"
                    ]
                },
                {
                    heading: "Air Handling Units (AHUs)",
                    items: [
                        "Number of major AHUs serving the building",
                        "Supply air volume per unit (m³/s or CFM)",
                        "Fan motor power (kW)",
                        "Cooling coil type (CHW coil / DX)"
                    ]
                }
            ]
        },
        bmsbasic: {
            title: "BMS Basics — Required Information",
            sections: [
                {
                    heading: "System Identification",
                    items: [
                        "BMS Brand (Honeywell / Siemens / Johnson Controls / Schneider / Tridium / Other)",
                        "Software Platform & Version (e.g., Desigo CC V7.x, Metasys 11.0)",
                        "Year of installation / last major upgrade",
                        "Protocol in use (BACnet / Modbus / LonWorks / Proprietary)"
                    ]
                },
                {
                    heading: "Data Logging Capability",
                    items: [
                        "Does your BMS log historical trend data? Yes / No",
                        "Minimum logging interval available (5 min / 15 min / 30 min)",
                        "Approximate number of logged data points (tags)",
                        "Retention period for historical data (e.g., 24 months)"
                    ]
                },
                {
                    heading: "Access & Export",
                    items: [
                        "Can historical data be exported to CSV? Yes / No / Unsure",
                        "Does your site have an IT/BMS engineer who can assist with the export?",
                        "Any network/firewall restrictions for remote access or file transfer?"
                    ]
                }
            ]
        },
        datapoints: {
            title: "Data Point List — Required Sensor Points",
            sections: [
                {
                    heading: "Essential Points (★★★ Must Have)",
                    items: [
                        "Timestamp — YYYY-MM-DD HH:MM:SS, every 5-15 min",
                        "Outdoor_Temp_C — Outdoor dry-bulb temperature (°C)",
                        "Outdoor_RH_% — Outdoor relative humidity (%)",
                        "Total_HVAC_Energy_kWh — Total HVAC electrical consumption",
                        "Chiller1_Status — On/Off status (1/0 or ON/OFF)",
                        "Chiller1_Power_kW — Active power draw",
                        "Chiller1_CHW_Supply_Temp_C — Chilled water supply temperature",
                        "Chiller1_CHW_Return_Temp_C — Chilled water return temperature"
                    ]
                },
                {
                    heading: "Important Points (★★ Highly Recommended)",
                    items: [
                        "Chiller1_CHW_Flow_m3h — Chilled water flow rate",
                        "CHW_Pump1_Status — Pump on/off status",
                        "CHW_Pump1_Frequency_Hz — VSD frequency (if VSD fitted)",
                        "CT1_Fan_Status — Cooling tower fan on/off",
                        "CT1_Fan_Frequency_Hz — Cooling tower fan VSD frequency",
                        "Cond_Water_Supply_Temp_C / Return_Temp_C"
                    ]
                },
                {
                    heading: "Optional Points (★ Nice to Have)",
                    items: [
                        "Zone1_Temp_C — Representative zone temperature",
                        "AHU1_Supply_Air_Temp_C — AHU supply air temperature",
                        "CO2_ppm — CO₂ concentration (if measured)",
                        "Occupancy_Count — Occupancy sensor count"
                    ]
                },
                {
                    heading: "File Naming Convention",
                    items: [
                        "Format: SiteName_StartDate_EndDate_Type.csv",
                        "Example: MelbourneOffice_20230101_20231231_HVAC.csv",
                        "Encoding: UTF-8 | Decimal separator: Period (.)",
                        "Column headers in English with units (e.g., Temp_C, Power_kW)"
                    ]
                }
            ]
        }
    };

    // Generate modal HTML for info sections (uses table-of-sections layout)
    function buildInfoModal(data) {
        const sectionsHtml = data.sections.map(sec => `
            <div class="modal-section">
                <div class="modal-section-title">${sec.heading}</div>
                <ul>${sec.items.map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
        `).join('');
        return `
            <h2 class="accent-text">${data.title}</h2>
            ${sectionsHtml}
            <div class="modal-footer">Fill in the Data Collection Form (Sheet corresponds to this section) and email to data@retragreen.com</div>
        `;
    }

    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach(card => {
        card.addEventListener('click', () => {
            const data = infoData[card.getAttribute('data-info')];
            openModal(buildInfoModal(data));
        });
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // WORKFLOW DIAGRAM — Node click → side panel + drawer
    // ═══════════════════════════════════════════════════════════════════════════

    // ── Right-panel data (simple list) ──────────────────────────────────────
    const workflowNodeData = {
        client: {
            title: 'Clients — Entry Point',
            items: ['Site name, address & building type', 'Primary contact & communication channel', 'Operational hours & HVAC season', 'Known system events in the last 2 years']
        },
        mvd: {
            title: 'MVD — Analysis Hub',
            items: ['Receives raw data package from client', 'Splits into Data Analysis & BMS Connection streams', 'Validates completeness before processing', 'Coordinates Water Side and Air Side workflows']
        },
        analyse: {
            title: 'Analyse Data',
            items: ['Historical CSV data quality check', 'Baseline energy & load profiling', 'Anomaly detection & gap flagging', 'Performance KPI calculation (COP, EER)']
        },
        bmsconn: {
            title: 'Connect BMS',
            items: ['Verify BMS brand, platform & version', 'Confirm protocol (BACnet / Modbus / LonWorks)', 'Map internal tag names to standard columns', 'Schedule live data export with facilities team']
        },
        'bms-water': {
            title: 'Connect BMS — Water Side',
            items: ['Chiller & pump status points (ON/OFF, kW)', 'Flow rates: CHW & condenser water loops', 'Cooling tower leaving water temperature', 'Differential pressure across primary loops']
        },
        'bms-air': {
            title: 'Connect BMS — Air Side',
            items: ['AHU supply air temp & humidity sensors', 'Fan VSD frequency & run-hours counters', 'Zone/room temperature & CO₂ points', 'Damper positions & fresh air flow rates']
        },
        email: {
            title: 'Generate Email — Output',
            items: ['Auto-compiled data package summary', 'Attached: completed Data Collection Form', 'Attached: historical CSV files (zipped)', 'Send to: data@retragreen.com']
        },
    };

    // ── Full data-point tables for drawer (from HVAC Checklist + MVD Spec) ──
    const drawerData = {
        'analyse-water': {
            type: 'water',
            title: 'Water Side — Required Data Points',
            groups: [
                {
                    id: 'water',
                    title: 'Chiller',
                    rows: [
                        { no: 1,  point: 'Chilled Water Supply Temperature',       unit: '°C / °F',      badge: 'req' },
                        { no: 2,  point: 'Chilled Water Return Temperature',        unit: '°C / °F',      badge: 'req' },
                        { no: 3,  point: 'Chilled Water Temperature Difference (ΔT)',unit: '°C / °F',     badge: 'req' },
                        { no: 4,  point: 'Chilled Water Flow Rate',                 unit: 'm³/h or GPM',  badge: 'req' },
                        { no: 5,  point: 'Condenser Water Supply Temperature',      unit: '°C / °F',      badge: 'req' },
                        { no: 6,  point: 'Condenser Water Return Temperature',      unit: '°C / °F',      badge: 'req' },
                        { no: 7,  point: 'Condenser Water Temperature Difference (ΔT)', unit: '°C / °F',  badge: 'req' },
                        { no: 8,  point: 'Condenser Water Flow Rate',               unit: 'm³/h or GPM',  badge: 'req' },
                        { no: 9,  point: 'Chiller Power Consumption',               unit: 'kW',           badge: 'req' },
                        { no: 10, point: 'Chiller Load Percentage',                 unit: '%',            badge: 'imp' },
                        { no: 11, point: 'Chiller Operating Status',                unit: 'ON / OFF',     badge: 'req' },
                        { no: 12, point: 'Evaporator Pressure',                     unit: 'kPa or PSI',   badge: 'imp' },
                        { no: 13, point: 'Condenser Pressure',                      unit: 'kPa or PSI',   badge: 'imp' },
                    ]
                },
                {
                    id: 'water',
                    title: 'Chilled Water Pump',
                    rows: [
                        { no: 14, point: 'CHW Pump Power Consumption',   unit: 'kW',          badge: 'req' },
                        { no: 15, point: 'CHW Pump Frequency / Speed',   unit: 'Hz or RPM',   badge: 'req' },
                        { no: 16, point: 'CHW Pump Operating Status',    unit: 'ON / OFF',    badge: 'req' },
                        { no: 17, point: 'CHW Supply Pressure',          unit: 'kPa or PSI',  badge: 'imp' },
                        { no: 18, point: 'CHW Return Pressure',          unit: 'kPa or PSI',  badge: 'imp' },
                    ]
                },
                {
                    id: 'water',
                    title: 'Condenser Water Pump & Cooling Tower',
                    rows: [
                        { no: 19, point: 'CW Pump Power Consumption',        unit: 'kW',       badge: 'req' },
                        { no: 20, point: 'CW Pump Frequency / Speed',        unit: 'Hz or RPM',badge: 'req' },
                        { no: 21, point: 'CW Pump Operating Status',         unit: 'ON / OFF', badge: 'req' },
                        { no: 22, point: 'Cooling Tower Fan Power',           unit: 'kW',       badge: 'req' },
                        { no: 23, point: 'Cooling Tower Fan Frequency',       unit: 'Hz',       badge: 'req' },
                        { no: 24, point: 'Cooling Tower Status',              unit: 'ON / OFF', badge: 'req' },
                        { no: 25, point: 'Outdoor Wet Bulb Temperature',      unit: '°C / °F',  badge: 'req' },
                        { no: 26, point: 'Outdoor Dry Bulb Temperature',      unit: '°C / °F',  badge: 'req' },
                    ]
                },
                {
                    id: 'water',
                    title: 'System Efficiency',
                    rows: [
                        { no: 47, point: 'Total System Power Consumption',  unit: 'kW',          badge: 'req' },
                        { no: 48, point: 'Total Cooling Capacity',          unit: 'RT or kW',    badge: 'req' },
                        { no: 49, point: 'Chiller COP',                     unit: 'Unitless',    badge: 'req' },
                        { no: 50, point: 'System COP',                      unit: 'Unitless',    badge: 'imp' },
                        { no: 51, point: 'System kW/RT',                    unit: 'kW/RT',       badge: 'imp' },
                    ]
                },
            ]
        },
        'analyse-air': {
            type: 'air',
            title: 'Air Side — Required Data Points',
            groups: [
                {
                    id: 'air',
                    title: 'AHU Fan & Airflow  (MANDATORY)',
                    rows: [
                        { no: 1,  point: 'Supply Fan Status',                   unit: 'ON / OFF',      badge: 'req' },
                        { no: 2,  point: 'Supply Fan Speed or Fan Power',        unit: '% / Hz / kW',   badge: 'req' },
                        { no: 3,  point: 'Supply Airflow Rate',                  unit: 'CFM / m³·s⁻¹', badge: 'req' },
                        { no: 35, point: 'Supply Fan Frequency',                 unit: 'Hz',            badge: 'req' },
                        { no: 36, point: 'Supply Fan Power',                     unit: 'kW',            badge: 'req' },
                        { no: 37, point: 'Return Fan Power',                     unit: 'kW',            badge: 'imp' },
                    ]
                },
                {
                    id: 'air',
                    title: 'Temperatures  (MANDATORY)',
                    rows: [
                        { no: 27, point: 'Supply Air Temperature (SAT)',         unit: '°C / °F',  badge: 'req' },
                        { no: 28, point: 'Return Air Temperature',               unit: '°C / °F',  badge: 'req' },
                        { no: 4,  point: 'SAT Setpoint',                         unit: '°C / °F',  badge: 'req' },
                        { no: 5,  point: 'Outdoor Air Temperature',              unit: '°C / °F',  badge: 'req' },
                    ]
                },
                {
                    id: 'air',
                    title: 'Supply Duct Pressure  (MANDATORY)',
                    rows: [
                        { no: 34, point: 'Supply Air Static Pressure',           unit: 'Pa / in.wg',    badge: 'req' },
                        { no: 6,  point: 'Static Pressure Setpoint',             unit: 'Pa / in.wg',    badge: 'req' },
                    ]
                },
                {
                    id: 'air',
                    title: 'Cooling Coil — Air / Water Bridge  (MANDATORY)',
                    rows: [
                        { no: 38, point: 'Cooling Valve Position',               unit: '%',        badge: 'req' },
                        { no: 7,  point: 'CHW Supply Temp to AHU',               unit: '°C / °F',  badge: 'req' },
                        { no: 8,  point: 'CHW Return Temp from AHU',             unit: '°C / °F',  badge: 'req' },
                    ]
                },
                {
                    id: 'air',
                    title: 'Dampers & Ventilation  (MANDATORY)',
                    rows: [
                        { no: 39, point: 'Fresh Air Damper Position',            unit: '%',             badge: 'req' },
                        { no: 40, point: 'Return Air Damper Position',           unit: '%',             badge: 'req' },
                        { no: 9,  point: 'Minimum Outdoor Air Setpoint',         unit: '% or CFM',      badge: 'req' },
                    ]
                },
                {
                    id: 'air',
                    title: 'Indoor Air Quality  (MANDATORY)',
                    rows: [
                        { no: 29, point: 'Supply Air Humidity',                  unit: '%RH',      badge: 'req' },
                        { no: 30, point: 'Return Air Humidity',                  unit: '%RH',      badge: 'req' },
                        { no: 10, point: 'Zone CO₂ (Average / Critical)',         unit: 'ppm',      badge: 'req' },
                    ]
                },
                {
                    id: 'air',
                    title: 'AHU Operating Mode  (MANDATORY)',
                    rows: [
                        { no: 41, point: 'AHU Operating Status',                 unit: 'ON / OFF',           badge: 'req' },
                        { no: 11, point: 'AHU Occupancy / Mode',                 unit: 'Occ/Unocc/Warm-up',  badge: 'req' },
                    ]
                },
                {
                    id: 'air',
                    title: 'Fan Coil Unit (FCU)',
                    rows: [
                        { no: 42, point: 'Room Temperature',                     unit: '°C / °F',            badge: 'imp' },
                        { no: 43, point: 'Room Humidity',                        unit: '%RH',                badge: 'imp' },
                        { no: 44, point: 'Room Temperature Setpoint',            unit: '°C / °F',            badge: 'imp' },
                        { no: 45, point: 'FCU Fan Speed',                        unit: 'High/Med/Low',       badge: 'opt' },
                        { no: 46, point: 'FCU Operating Status',                 unit: 'ON / OFF',           badge: 'imp' },
                    ]
                },
                {
                    id: 'air',
                    title: 'Additional Air-Side',
                    rows: [
                        { no: 31, point: 'Supply Air Enthalpy',                  unit: 'kJ/kg or BTU/lb',   badge: 'opt' },
                        { no: 32, point: 'Return Air Enthalpy',                  unit: 'kJ/kg or BTU/lb',   badge: 'opt' },
                        { no: 33, point: 'Supply Air Flow Rate',                 unit: 'm³/h or CFM',       badge: 'imp' },
                    ]
                },
            ]
        },
        'bms-water': {
            type: 'water',
            title: 'Connect BMS — Water Side Read & Write Points',
            groups: [
                {
                    id: 'water',
                    title: 'Strategy 1 — Chilled Water Valve',
                    rows: [
                        { no: 1, point: 'Chilled Valve Opening Feedback',            unit: '%',         access: 'Read' },
                        { no: 2, point: 'Chilled Valve Opening Setpoint',            unit: '%',         access: 'Read / Write' },
                        { no: 3, point: 'Chilled Water Inlet Temperature Feedback',  unit: '°C',        access: 'Read' },
                        { no: 4, point: 'Chilled Water Outlet Temperature Feedback', unit: '°C',        access: 'Read' },
                        { no: 5, point: 'Chiller CHW Side Flow Feedback',            unit: 'm³/h',      access: 'Read' },
                    ]
                },
                {
                    id: 'water',
                    title: 'Strategy 2 — Cooling Water Valve',
                    rows: [
                        { no: 6,  point: 'Cooling Valve Opening Feedback',             unit: '%',         access: 'Read' },
                        { no: 7,  point: 'Cooling Valve Opening Setpoint',             unit: '%',         access: 'Read / Write' },
                        { no: 8,  point: 'Cooling Water Inlet Temperature Feedback',   unit: '°C',        access: 'Read' },
                        { no: 9,  point: 'Cooling Water Outlet Temperature Feedback',  unit: '°C',        access: 'Read' },
                        { no: 10, point: 'Chiller Cooling Water Side Flow Feedback',   unit: 'm³/h',      access: 'Read' },
                    ]
                },
                {
                    id: 'water',
                    title: 'Strategy 3 — Chiller Leaving Water Temperature',
                    rows: [
                        { no: 11, point: 'Outdoor Temperature / Humidity Feedback',        unit: '°C / %RH',  access: 'Read' },
                        { no: 12, point: 'Chiller CHW Outlet Temperature Setpoint',        unit: '°C',        access: 'Read / Write' },
                        { no: 13, point: 'Chiller CHW Outlet Temperature Feedback',        unit: '°C',        access: 'Read' },
                        { no: 14, point: 'Chiller CHW Return Temperature Feedback',        unit: '°C',        access: 'Read' },
                        { no: 15, point: 'Chiller CHW Real-Time Flow Feedback',            unit: 'm³/h',      access: 'Read' },
                    ]
                },
                {
                    id: 'water',
                    title: 'Strategy 4 — Cooling Tower Leaving Water Temperature',
                    rows: [
                        { no: 16, point: 'Outdoor Temperature / Humidity Feedback',        unit: '°C / %RH',  access: 'Read' },
                        { no: 17, point: 'Cooling Water Leaving Tower Temperature Setpoint', unit: '°C',      access: 'Read / Write' },
                        { no: 18, point: 'Cooling Tower Fan Running Signal',               unit: 'ON / OFF',   access: 'Read' },
                        { no: 19, point: 'Cooling Tower Fan Frequency Feedback',           unit: 'Hz',         access: 'Read' },
                        { no: 20, point: 'Cooling Tower Fan Frequency Setpoint',           unit: 'Hz',         access: 'Read / Write' },
                        { no: 21, point: 'Cooling Water Leaving Tower Temperature Feedback', unit: '°C',      access: 'Read' },
                    ]
                },
                {
                    id: 'water',
                    title: 'Strategy 6 — Chilled Water Pump Pressure',
                    rows: [
                        { no: 22, point: 'CHW Supply Pipe Pressure Feedback',    unit: 'kPa',       access: 'Read' },
                        { no: 23, point: 'CHW Return Pipe Pressure Feedback',    unit: 'kPa',       access: 'Read' },
                        { no: 24, point: 'CHW Pump Running Signal Feedback',     unit: 'ON / OFF',  access: 'Read' },
                        { no: 25, point: 'CHW Pump Running Frequency Feedback',  unit: 'Hz',        access: 'Read' },
                        { no: 26, point: 'CHW Pump Frequency Setpoint',          unit: 'Hz',        access: 'Read / Write' },
                        { no: 27, point: 'Chiller CHW Side Real-Time Flow Feedback', unit: 'm³/h', access: 'Read' },
                    ]
                },
                {
                    id: 'water',
                    title: 'Strategy 7 — Cooling Water Pump Pressure',
                    rows: [
                        { no: 28, point: 'CW Supply Pipe Pressure Feedback',     unit: 'kPa',       access: 'Read' },
                        { no: 29, point: 'CW Return Pipe Pressure Feedback',     unit: 'kPa',       access: 'Read' },
                        { no: 30, point: 'CW Pump Running Signal Feedback',      unit: 'ON / OFF',  access: 'Read' },
                        { no: 31, point: 'CW Pump Running Frequency Feedback',   unit: 'Hz',        access: 'Read' },
                        { no: 32, point: 'CW Pump Frequency Setpoint',           unit: 'Hz',        access: 'Read / Write' },
                    ]
                },
            ]
        },
        'bms-air': {
            type: 'air',
            title: 'Connect BMS — Air Side Read & Write Points',
            groups: [
                {
                    id: 'air',
                    title: 'Strategy 5 — Fan Coil Unit Temperature',
                    rows: [
                        { no: 1, point: 'Outdoor Temperature / Humidity Feedback',  unit: '°C / %RH',      access: 'Read' },
                        { no: 2, point: 'Indoor Temperature / Humidity Feedback',   unit: '°C / %RH',      access: 'Read' },
                        { no: 3, point: 'Indoor Temperature Setpoint',              unit: '°C',             access: 'Read / Write' },
                        { no: 4, point: 'FCU Fan Speed Control Point',              unit: 'High/Med/Low',   access: 'Read / Write' },
                    ]
                },
                {
                    id: 'air',
                    title: 'Strategy 8 — Terminal Indoor Temperature Setpoint',
                    rows: [
                        { no: 5, point: 'Indoor Temperature Feedback',   unit: '°C',   access: 'Read' },
                        { no: 6, point: 'Indoor Temperature Setpoint',   unit: '°C',   access: 'Read / Write' },
                        { no: 7, point: 'Outdoor Temperature Feedback',  unit: '°C',   access: 'Read' },
                    ]
                },
                {
                    id: 'air',
                    title: 'Strategy 9 — Terminal Fan Coil Unit Control',
                    rows: [
                        { no: 8,  point: 'Indoor Temperature Feedback',   unit: '°C',             access: 'Read' },
                        { no: 9,  point: 'Fan Running Status',            unit: 'ON / OFF',        access: 'Read' },
                        { no: 10, point: 'Fan Speed Feedback',            unit: 'High/Med/Low',    access: 'Read' },
                        { no: 11, point: 'Fan Speed Setpoint',            unit: 'High/Med/Low',    access: 'Read / Write' },
                        { no: 12, point: 'Indoor Temperature Setpoint',   unit: '°C',              access: 'Read / Write' },
                    ]
                },
                {
                    id: 'air',
                    title: 'Strategy 10 — AHU with Chilled Water Valve',
                    rows: [
                        { no: 13, point: 'Indoor Temperature Feedback',          unit: '°C',   access: 'Read' },
                        { no: 14, point: 'Indoor Temperature Setpoint',          unit: '°C',   access: 'Read / Write' },
                        { no: 15, point: 'CHW Valve Opening Feedback',           unit: '%',    access: 'Read' },
                        { no: 16, point: 'CHW Valve Opening Setpoint',           unit: '%',    access: 'Read / Write' },
                        { no: 17, point: 'AHU Filter Clogging Alarm Signal',     unit: 'Alarm',access: 'Read' },
                        { no: 18, point: 'Enthalpy Feedback (Supply / Return)',  unit: 'kJ/kg',access: 'Read' },
                    ]
                },
            ]
        },
    };

    // Badge label map
    const badgeLabel = { req: 'Required', imp: 'Recommended', opt: 'Optional' };
    const badgeClass = { req: 'dp-badge--req', imp: 'dp-badge--imp', opt: 'dp-badge--opt' };

    function buildDrawer(key) {
        const d = drawerData[key];
        const isWater = d.type === 'water';
        const isBMS = key === 'bms-water' || key === 'bms-air';
        const badgeSpan = isWater
            ? `<span class="badge-water">Water Side</span>`
            : `<span class="badge-air">Air Side</span>`;

        const groupsHtml = d.groups.map(g => `
            <div class="wf-dp-group wf-dp-group--${g.id}">
                <div class="wf-dp-group-title">${g.title}</div>
                <table class="wf-dp-table">
                    <thead><tr>
                        <th>#</th>
                        <th>Data Point</th>
                        ${isBMS ? '<th>Access</th>' : '<th>Priority</th>'}
                        <th>Unit</th>
                    </tr></thead>
                    <tbody>${g.rows.map(r => `
                        <tr>
                            <td>${r.no}</td>
                            <td>${r.point}</td>
                            <td>${isBMS
                                ? `<span class="dp-badge ${r.access.includes('Write') ? 'dp-badge--rw' : 'dp-badge--ro'}">${r.access}</span>`
                                : `<span class="dp-badge ${badgeClass[r.badge]}">${badgeLabel[r.badge]}</span>`
                            }</td>
                            <td>${r.unit}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>`).join('');

        return `
        <div class="wf-drawer-inner">
            <div class="wf-drawer-header">
                <div class="wf-drawer-title">${d.title} ${badgeSpan}</div>
                <div class="wf-drawer-close" id="wfDrawerClose">✕ Close</div>
            </div>
            <div class="wf-drawer-meta">
                ${isBMS ? `
                <div class="wf-drawer-meta-item"><strong>Protocol:</strong> BACnet / Modbus / LonWorks</div>
                <div class="wf-drawer-meta-item"><strong>Access Type:</strong> Read (feedback) &amp; Read/Write (setpoints)</div>
                <div class="wf-drawer-meta-item"><strong>Poll Rate:</strong> ≤ 15 min live push</div>
                <div class="wf-drawer-meta-item"><strong>Setpoint Guard:</strong> Auto-adjust within defined limits</div>
                ` : `
                <div class="wf-drawer-meta-item"><strong>Period:</strong> Min 1 month continuous</div>
                <div class="wf-drawer-meta-item"><strong>Interval:</strong> ≤ 15 min sampling</div>
                <div class="wf-drawer-meta-item"><strong>Format:</strong> CSV or .xlsx</div>
                <div class="wf-drawer-meta-item"><strong>Completeness:</strong> ≥ 95% over 30 days</div>
                <div class="wf-drawer-meta-item"><strong>Timestamp:</strong> YYYY-MM-DD HH:MM:SS</div>
                `}
            </div>
            ${groupsHtml}
            <div class="wf-drawer-quality">
                ${isBMS ? `
                <div class="wf-dq-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Confirm BMS supports <strong>remote read / write</strong> for all setpoint points</span>
                </div>
                <div class="wf-dq-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Setpoint adjustments must stay within manufacturer safety limits</span>
                </div>
                <div class="wf-dq-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>BACnet object IDs must remain <strong>fixed after commissioning</strong></span>
                </div>
                <div class="wf-dq-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Verify tag mapping with facilities team before live deployment</span>
                </div>
                ` : `
                <div class="wf-dq-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Sensors calibrated within last <strong>24 months</strong></span>
                </div>
                <div class="wf-dq-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>No mixed unit systems per signal class</span>
                </div>
                <div class="wf-dq-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>BACnet object IDs must remain <strong>fixed after commissioning</strong></span>
                </div>
                <div class="wf-dq-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>No outliers or unexplained zero-value gaps</span>
                </div>
                `}
            </div>
        </div>`;
    }

    // ── Panel & Drawer state ────────────────────────────────────────────────
    const wfPanel  = document.getElementById('wfPanel');
    const wfDrawer = document.getElementById('wfDrawer');
    let activeNode   = null;
    let activeDrawer = null;

    function renderPanel(key) {
        const data = workflowNodeData[key];
        if (!data) return;
        wfPanel.classList.add('has-content');
        wfPanel.innerHTML = `
            <div class="wf-panel-title">${data.title}</div>
            <ul class="wf-panel-list">${data.items.map(i => `<li>${i}</li>`).join('')}</ul>
            <div class="wf-panel-close" data-close="1">✕ Close</div>
        `;
        wfPanel.querySelector('[data-close]').addEventListener('click', clearAll);
    }

    function openDrawer(key) {
        wfDrawer.innerHTML = buildDrawer(key);
        wfDrawer.classList.add('open');
        activeDrawer = key;
        // scroll so drawer is visible
        setTimeout(() => wfDrawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
        document.getElementById('wfDrawerClose').addEventListener('click', closeDrawer);
    }

    function closeDrawer() {
        wfDrawer.classList.remove('open');
        activeDrawer = null;
    }

    function clearPanel() {
        wfPanel.classList.remove('has-content');
        wfPanel.innerHTML = `
            <div class="wf-panel-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p>Click a node to see details</p>
            </div>`;
    }

    function clearAll() {
        clearPanel();
        closeDrawer();
        if (activeNode) { activeNode.classList.remove('active'); activeNode = null; }
    }

    document.querySelectorAll('.wf-node').forEach(node => {
        node.addEventListener('click', (e) => {
            e.stopPropagation();
            const key = node.getAttribute('data-node');
            const isAnalyseNode = key === 'analyse-water' || key === 'analyse-air';
            const isDrawerNode = key === 'bms-water' || key === 'bms-air';

            // The new generator replaces the legacy static Analyse Data drawers.
            if (isAnalyseNode) {
                document.querySelector('.nav-item[data-view="analyse"]')?.click();
                location.hash = 'analyse';
                const sideFilter = document.getElementById('sideFilter');
                if (sideFilter) {
                    sideFilter.value = key === 'analyse-water' ? 'Water' : 'Air';
                    sideFilter.dispatchEvent(new Event('change', { bubbles: true }));
                }
                return;
            }

            // Toggle off same node
            if (activeNode === node) { clearAll(); return; }

            // Deactivate previous node highlight
            if (activeNode) activeNode.classList.remove('active');
            activeNode = node;
            node.classList.add('active');

            if (isDrawerNode) {
                // Drawer nodes: clear right panel + open bottom drawer
                clearPanel();
                openDrawer(key);
            } else {
                // Regular nodes: close drawer + show right panel
                closeDrawer();
                renderPanel(key);
            }
        });
    });

    // Dismiss on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.wf-node') && !e.target.closest('.wf-panel') && !e.target.closest('.wf-drawer')) {
            clearAll();
        }
    });

    // ── Topology-aware HVAC requirement generator ──────────────────────────
    const analyseView = document.getElementById('analyse');
    const pointClass = {
        core:        { label: 'Must have', csv: 'Core Required' },
        conditional: { label: 'If applicable', csv: 'Conditional Required' },
        recommended: { label: 'Recommended', csv: 'Recommended' },
        optional:    { label: 'Nice to have', csv: 'Optional' },
        derived:     { label: 'Calculated', csv: 'Derived' }
    };

    const point = (side, module, name, tag, requirement, unit, applies, instance, use, derivable = '') => ({
        side, module, name, tag, requirement, unit, applies, instance, use, derivable
    });

    const masterCatalogue = [
        // Common / site context
        point('Common', 'Site', 'Outdoor Air Dry-bulb Temperature', 'SITE_OAT_C', 'core', '°C', 'always', null, 'Weather normalisation and plant reset analysis'),
        point('Common', 'Site', 'Outdoor Air Relative Humidity', 'SITE_OARH_PCT', 'recommended', '%RH', 'always', null, 'Weather normalisation and psychrometric analysis'),
        point('Common', 'Controls', 'Site Occupancy Mode', 'SITE_OCC_MODE', 'recommended', 'Mode', 'always', null, 'Separate occupied, unoccupied and warm-up operation'),
        point('Common', 'Controls', 'Plant Operating Mode', 'PLANT_MODE', 'conditional', 'Mode', 'chilledWater', null, 'Validate sequencing, staging and operator overrides'),
        point('Common', 'Metering', 'HVAC Main Electricity Power', 'HVAC_MAIN_POWER_KW', 'recommended', 'kW', 'always', null, 'Whole-system energy baseline and reconciliation'),

        // Chillers
        point('Water', 'Chiller', 'Operating Status', 'CHLR{n}_STATUS', 'core', '0 / 1', 'chilledWater', 'chiller', 'Runtime, staging and enabled-but-off fault analysis'),
        point('Water', 'Chiller', 'Enable Command', 'CHLR{n}_ENABLE_CMD', 'conditional', '0 / 1', 'chilledWater', 'chiller', 'Compare plant command with equipment feedback'),
        point('Water', 'Chiller', 'Power Consumption', 'CHLR{n}_POWER_KW', 'core', 'kW', 'chilledWater', 'chiller', 'Equipment energy and efficiency analysis'),
        point('Water', 'Chiller', 'Load Percentage', 'CHLR{n}_LOAD_PCT', 'recommended', '%', 'chilledWater', 'chiller', 'Part-load efficiency and staging analysis'),
        point('Water', 'Chiller', 'Leaving CHW Temperature', 'CHLR{n}_LCHWT_C', 'core', '°C', 'chilledWater', 'chiller', 'Cooling delivery and setpoint tracking'),
        point('Water', 'Chiller', 'Leaving CHW Temperature Setpoint', 'CHLR{n}_LCHWT_SP_C', 'conditional', '°C', 'chilledWater', 'chiller', 'Setpoint tracking and reset-strategy analysis'),
        point('Water', 'Chiller', 'Entering CHW Temperature', 'CHLR{n}_ECHWT_C', 'core', '°C', 'chilledWater', 'chiller', 'Load and evaporator temperature difference'),
        point('Water', 'Chiller', 'Evaporator Flow', 'CHLR{n}_EVAP_FLOW_M3H', 'core', 'm³/h', 'chilledWater', 'chiller', 'Cooling load and minimum-flow validation'),
        point('Water', 'Chiller', 'Evaporator Pressure', 'CHLR{n}_EVAP_PRESS_KPA', 'recommended', 'kPa', 'chilledWater', 'chiller', 'Refrigeration-cycle diagnostics'),
        point('Water', 'Chiller', 'Condenser Entering Water Temperature', 'CHLR{n}_ECWT_C', 'core', '°C', 'waterCooled', 'chiller', 'Condenser approach and tower performance'),
        point('Water', 'Chiller', 'Condenser Leaving Water Temperature', 'CHLR{n}_LCWT_C', 'core', '°C', 'waterCooled', 'chiller', 'Condenser heat rejection analysis'),
        point('Water', 'Chiller', 'Condenser Water Flow', 'CHLR{n}_COND_FLOW_M3H', 'conditional', 'm³/h', 'waterCooled', 'chiller', 'Condenser load and flow validation'),
        point('Water', 'Chiller', 'Condenser Pressure', 'CHLR{n}_COND_PRESS_KPA', 'recommended', 'kPa', 'chilledWater', 'chiller', 'Refrigeration-cycle and lift diagnostics'),
        point('Water', 'Chiller', 'Alarm / Fault Code', 'CHLR{n}_ALARM', 'recommended', 'Code', 'chilledWater', 'chiller', 'Correlate performance degradation with faults'),
        point('Water', 'Chiller', 'Cooling Capacity', 'CHLR{n}_COOLING_KW', 'derived', 'kW', 'chilledWater', 'chiller', 'Standardised delivered cooling', 'Evaporator flow + entering/leaving CHW temperatures'),
        point('Water', 'Chiller', 'COP', 'CHLR{n}_COP', 'derived', '—', 'chilledWater', 'chiller', 'Comparable chiller efficiency KPI', 'Cooling capacity ÷ chiller power'),
        point('Water', 'Chiller', 'kW per Refrigeration Ton', 'CHLR{n}_KW_RT', 'derived', 'kW/RT', 'chilledWater', 'chiller', 'Comparable chiller efficiency KPI', 'Chiller power + cooling capacity'),

        // Air-cooled condenser
        point('Water', 'Air-cooled Chiller', 'Condenser Fan Status', 'CHLR{n}_COND_FAN_STATUS', 'conditional', '0 / 1', 'airCooled', 'chiller', 'Condenser fan staging analysis'),
        point('Water', 'Air-cooled Chiller', 'Condenser Fan Speed', 'CHLR{n}_COND_FAN_SPEED_PCT', 'recommended', '%', 'airCooled', 'chiller', 'Head-pressure and fan-control analysis'),
        point('Water', 'Air-cooled Chiller', 'Condenser Fan Power', 'CHLR{n}_COND_FAN_POWER_KW', 'recommended', 'kW', 'airCooled', 'chiller', 'Complete chiller-system energy balance'),

        // CHW plant and pumps
        point('Water', 'CHW Plant', 'Header Supply Temperature', 'CHW_HEADER_SUPPLY_C', 'core', '°C', 'chilledWater', null, 'Plant cooling delivery'),
        point('Water', 'CHW Plant', 'Header Return Temperature', 'CHW_HEADER_RETURN_C', 'core', '°C', 'chilledWater', null, 'Plant load and low-delta-T analysis'),
        point('Water', 'CHW Plant', 'System Flow', 'CHW_FLOW_M3H', 'core', 'm³/h', 'chilledWater', null, 'Plant load, flow and sequencing analysis'),
        point('Water', 'CHW Plant', 'Temperature Difference', 'CHW_DT_C', 'derived', 'K', 'chilledWater', null, 'Low-delta-T and heat-transfer analysis', 'Header return temperature − header supply temperature'),
        point('Water', 'CHW Plant', 'Differential Pressure', 'CHW_DP_KPA', 'conditional', 'kPa', 'variableFlow', null, 'Pump control and valve-authority analysis'),
        point('Water', 'CHW Plant', 'Differential Pressure Setpoint', 'CHW_DP_SP_KPA', 'conditional', 'kPa', 'variableFlow', null, 'DP reset and setpoint-tracking analysis'),
        point('Water', 'CHW Plant', 'Total Power', 'CHW_PLANT_POWER_KW', 'core', 'kW', 'chilledWater', null, 'Plant-level energy and efficiency'),
        point('Water', 'CHW Plant', 'Total Cooling Capacity', 'CHW_PLANT_COOLING_KW', 'derived', 'kW', 'chilledWater', null, 'Standardised cooling output', 'System CHW flow + header supply/return temperatures'),
        point('Water', 'CHW Plant', 'System COP', 'CHW_PLANT_COP', 'derived', '—', 'chilledWater', null, 'Whole-plant efficiency benchmark', 'Total cooling capacity ÷ total plant power'),
        point('Water', 'CHW Plant', 'System kW/RT', 'CHW_PLANT_KW_RT', 'derived', 'kW/RT', 'chilledWater', null, 'Whole-plant efficiency benchmark', 'Total plant power + total cooling capacity'),
        point('Water', 'CHW Plant', 'Decoupler / Common Pipe Flow', 'CHW_DECOUPLER_FLOW_M3H', 'conditional', 'm³/h', 'primarySecondary', null, 'Primary-secondary flow balance and overflow analysis'),
        point('Water', 'CHW Plant', 'Bypass Valve Position', 'CHW_BYPASS_VALVE_PCT', 'optional', '%', 'variablePrimary', null, 'Minimum-flow and bypass-energy analysis'),
        point('Water', 'CHW Pump', 'Operating Status', 'CHWP{n}_STATUS', 'core', '0 / 1', 'chilledWater', 'chwp', 'Runtime and staging analysis'),
        point('Water', 'CHW Pump', 'Power Consumption', 'CHWP{n}_POWER_KW', 'core', 'kW', 'chilledWater', 'chwp', 'Pump energy and efficiency'),
        point('Water', 'CHW Pump', 'Speed Feedback', 'CHWP{n}_SPEED_HZ', 'conditional', 'Hz', 'variableFlow', 'chwp', 'Variable-flow control performance'),
        point('Water', 'CHW Pump', 'Speed Command', 'CHWP{n}_SPEED_CMD_HZ', 'recommended', 'Hz', 'variableFlow', 'chwp', 'Command/feedback tracking and override detection'),
        point('Water', 'CHW Pump', 'Suction Pressure', 'CHWP{n}_SUCTION_KPA', 'recommended', 'kPa', 'chilledWater', 'chwp', 'Pump head and sensor validation'),
        point('Water', 'CHW Pump', 'Discharge Pressure', 'CHWP{n}_DISCHARGE_KPA', 'recommended', 'kPa', 'chilledWater', 'chwp', 'Pump head and control analysis'),
        point('Water', 'CHW Pump', 'Alarm / Fault', 'CHWP{n}_ALARM', 'optional', 'Code', 'chilledWater', 'chwp', 'Correlate pump faults with plant operation'),

        // Condenser water and cooling towers
        point('Water', 'CW Pump', 'Operating Status', 'CWP{n}_STATUS', 'core', '0 / 1', 'waterCooled', 'cwp', 'Runtime and staging analysis'),
        point('Water', 'CW Pump', 'Power Consumption', 'CWP{n}_POWER_KW', 'core', 'kW', 'waterCooled', 'cwp', 'Condenser pump energy'),
        point('Water', 'CW Pump', 'Speed Feedback', 'CWP{n}_SPEED_HZ', 'conditional', 'Hz', 'waterCooled', 'cwp', 'Condenser-flow control performance'),
        point('Water', 'CW Pump', 'Speed Command', 'CWP{n}_SPEED_CMD_HZ', 'recommended', 'Hz', 'waterCooled', 'cwp', 'Command/feedback tracking'),
        point('Water', 'CW Pump', 'Suction Pressure', 'CWP{n}_SUCTION_KPA', 'optional', 'kPa', 'waterCooled', 'cwp', 'Pump head validation'),
        point('Water', 'CW Pump', 'Discharge Pressure', 'CWP{n}_DISCHARGE_KPA', 'optional', 'kPa', 'waterCooled', 'cwp', 'Pump head validation'),
        point('Water', 'Cooling Tower', 'Operating Status', 'CT{n}_STATUS', 'core', '0 / 1', 'waterCooled', 'tower', 'Tower staging and availability'),
        point('Water', 'Cooling Tower', 'Fan Power', 'CT{n}_FAN_POWER_KW', 'core', 'kW', 'waterCooled', 'tower', 'Heat-rejection energy'),
        point('Water', 'Cooling Tower', 'Fan Speed Feedback', 'CT{n}_FAN_SPEED_HZ', 'core', 'Hz', 'waterCooled', 'tower', 'Tower control and approach analysis'),
        point('Water', 'Cooling Tower', 'Fan Speed Command', 'CT{n}_FAN_SPEED_CMD_HZ', 'recommended', 'Hz', 'waterCooled', 'tower', 'Command/feedback tracking'),
        point('Water', 'Cooling Tower', 'Leaving Water Temperature', 'CT{n}_LWT_C', 'core', '°C', 'waterCooled', 'tower', 'Tower approach and condenser-water control'),
        point('Water', 'Cooling Tower', 'Leaving Water Temperature Setpoint', 'CT{n}_LWT_SP_C', 'conditional', '°C', 'waterCooled', 'tower', 'Setpoint tracking and reset strategy'),
        point('Water', 'Cooling Tower', 'Entering Water Temperature', 'CT{n}_EWT_C', 'recommended', '°C', 'waterCooled', 'tower', 'Tower range and heat rejection'),
        point('Water', 'Cooling Tower', 'Basin Water Temperature', 'CT{n}_BASIN_TEMP_C', 'optional', '°C', 'waterCooled', 'tower', 'Freeze protection and tower operation'),
        point('Water', 'CW Loop', 'Supply Temperature', 'CW_SUPPLY_C', 'core', '°C', 'waterCooled', null, 'Condenser-water delivery'),
        point('Water', 'CW Loop', 'Return Temperature', 'CW_RETURN_C', 'core', '°C', 'waterCooled', null, 'Heat rejection'),
        point('Water', 'CW Loop', 'System Flow', 'CW_FLOW_M3H', 'conditional', 'm³/h', 'waterCooled', null, 'Condenser load and flow validation'),
        point('Water', 'CW Loop', 'Temperature Difference', 'CW_DT_C', 'derived', 'K', 'waterCooled', null, 'Heat-rejection analysis', 'CW return temperature − CW supply temperature'),

        // AHUs
        point('Air', 'AHU', 'Operating Status', 'AHU{n}_STATUS', 'core', '0 / 1', 'ahu', 'ahu', 'Runtime and schedule analysis'),
        point('Air', 'AHU', 'Supply Air Temperature', 'AHU{n}_SAT_C', 'core', '°C', 'ahu', 'ahu', 'Cooling delivery and control performance'),
        point('Air', 'AHU', 'SAT Setpoint', 'AHU{n}_SAT_SP_C', 'conditional', '°C', 'ahu', 'ahu', 'Setpoint tracking, reset and hunting analysis'),
        point('Air', 'AHU', 'Return Air Temperature', 'AHU{n}_RAT_C', 'core', '°C', 'ahu', 'ahu', 'Zone-load and air-side delta-T analysis'),
        point('Air', 'AHU', 'Mixed Air Temperature', 'AHU{n}_MAT_C', 'recommended', '°C', 'ahu', 'ahu', 'Economiser and damper fault analysis'),
        point('Air', 'AHU', 'Supply Fan Status', 'AHU{n}_SF_STATUS', 'core', '0 / 1', 'ahu', 'ahu', 'Fan operation and schedule validation'),
        point('Air', 'AHU', 'Supply Fan Speed Feedback', 'AHU{n}_SF_SPEED_PCT', 'core', '%', 'ahu', 'ahu', 'Fan control and energy analysis'),
        point('Air', 'AHU', 'Supply Fan Speed Command', 'AHU{n}_SF_SPEED_CMD_PCT', 'recommended', '%', 'ahu', 'ahu', 'Command/feedback tracking and saturation'),
        point('Air', 'AHU', 'Supply Fan Power', 'AHU{n}_SF_POWER_KW', 'core', 'kW', 'ahu', 'ahu', 'Fan energy and efficiency'),
        point('Air', 'AHU', 'Supply Airflow', 'AHU{n}_SA_FLOW_M3S', 'core', 'm³/s', 'ahu', 'ahu', 'Ventilation and fan-system analysis'),
        point('Air', 'AHU', 'Duct Static Pressure', 'AHU{n}_SA_STATIC_PA', 'conditional', 'Pa', 'ahu', 'ahu', 'Static-pressure control and VAV optimisation'),
        point('Air', 'AHU', 'Duct Static Pressure Setpoint', 'AHU{n}_SA_STATIC_SP_PA', 'conditional', 'Pa', 'ahu', 'ahu', 'Setpoint tracking and static reset'),
        point('Air', 'AHU', 'Return Fan Status', 'AHU{n}_RF_STATUS', 'recommended', '0 / 1', 'ahu', 'ahu', 'Air-balance and building-pressure analysis'),
        point('Air', 'AHU', 'Return Fan Speed', 'AHU{n}_RF_SPEED_PCT', 'recommended', '%', 'ahu', 'ahu', 'Air-balance and fan control'),
        point('Air', 'AHU', 'Return Fan Power', 'AHU{n}_RF_POWER_KW', 'optional', 'kW', 'ahu', 'ahu', 'Complete AHU energy balance'),
        point('Air', 'AHU', 'Cooling Valve Position Feedback', 'AHU{n}_CLG_VALVE_PCT', 'core', '%', 'ahuChw', 'ahu', 'Cooling demand, valve saturation and leakage'),
        point('Air', 'AHU', 'Cooling Valve Command', 'AHU{n}_CLG_VALVE_CMD_PCT', 'recommended', '%', 'ahuChw', 'ahu', 'Command/feedback and actuator analysis'),
        point('Air', 'AHU', 'Coil CHW Supply Temperature', 'AHU{n}_COIL_CHWS_C', 'conditional', '°C', 'ahuChw', 'ahu', 'Coil heat-transfer analysis'),
        point('Air', 'AHU', 'Coil CHW Return Temperature', 'AHU{n}_COIL_CHWR_C', 'conditional', '°C', 'ahuChw', 'ahu', 'Coil heat-transfer analysis'),
        point('Air', 'AHU', 'Outdoor Air Damper Position', 'AHU{n}_OA_DAMPER_PCT', 'recommended', '%', 'ahu', 'ahu', 'Ventilation and economiser diagnostics'),
        point('Air', 'AHU', 'Return Air Damper Position', 'AHU{n}_RA_DAMPER_PCT', 'optional', '%', 'ahu', 'ahu', 'Mixed-air and economiser diagnostics'),
        point('Air', 'AHU', 'Outdoor Airflow', 'AHU{n}_OA_FLOW_M3S', 'recommended', 'm³/s', 'ahu', 'ahu', 'Ventilation compliance and excess outside air'),
        point('Air', 'AHU', 'Economiser Mode', 'AHU{n}_ECON_MODE', 'recommended', 'Mode', 'ahu', 'ahu', 'Economiser sequence validation'),
        point('Air', 'AHU', 'Supply Air Relative Humidity', 'AHU{n}_SARH_PCT', 'recommended', '%RH', 'ahu', 'ahu', 'Latent-load and comfort analysis'),
        point('Air', 'AHU', 'Return Air Relative Humidity', 'AHU{n}_RARH_PCT', 'recommended', '%RH', 'ahu', 'ahu', 'Latent-load and comfort analysis'),
        point('Air', 'AHU', 'Return Air CO₂', 'AHU{n}_RA_CO2_PPM', 'recommended', 'ppm', 'ahu', 'ahu', 'IAQ and demand-controlled ventilation'),
        point('Air', 'AHU', 'Filter Differential Pressure', 'AHU{n}_FILTER_DP_PA', 'recommended', 'Pa', 'ahu', 'ahu', 'Filter loading and fan-energy impact'),
        point('Air', 'AHU', 'Heating Valve Position', 'AHU{n}_HTG_VALVE_PCT', 'optional', '%', 'ahu', 'ahu', 'Simultaneous heating/cooling detection'),
        point('Air', 'AHU', 'Supply Air Enthalpy', 'AHU{n}_SA_ENTHALPY_KJKG', 'derived', 'kJ/kg', 'ahu', 'ahu', 'Psychrometric and coil analysis', 'Supply air temperature + humidity'),
        point('Air', 'AHU', 'Return Air Enthalpy', 'AHU{n}_RA_ENTHALPY_KJKG', 'derived', 'kJ/kg', 'ahu', 'ahu', 'Psychrometric and coil analysis', 'Return air temperature + humidity'),
        point('Air', 'AHU', 'Air-side Temperature Difference', 'AHU{n}_AIR_DT_C', 'derived', 'K', 'ahu', 'ahu', 'Air-side cooling performance', 'Return air temperature − supply air temperature'),

        // VAV, FCU, DX, VRF and DOAS
        point('Air', 'VAV', 'Zone Temperature', 'VAV{n}_ZONE_TEMP_C', 'core', '°C', 'vav', 'vav', 'Zone comfort and control performance'),
        point('Air', 'VAV', 'Zone Temperature Setpoint', 'VAV{n}_ZONE_TEMP_SP_C', 'core', '°C', 'vav', 'vav', 'Zone tracking error and comfort'),
        point('Air', 'VAV', 'Airflow', 'VAV{n}_AIRFLOW_M3S', 'core', 'm³/s', 'vav', 'vav', 'Ventilation and static-pressure optimisation'),
        point('Air', 'VAV', 'Airflow Setpoint', 'VAV{n}_AIRFLOW_SP_M3S', 'conditional', 'm³/s', 'vav', 'vav', 'Flow tracking and terminal control'),
        point('Air', 'VAV', 'Damper Position', 'VAV{n}_DAMPER_PCT', 'core', '%', 'vav', 'vav', 'Damper saturation and static reset'),
        point('Air', 'VAV', 'Reheat Valve Position', 'VAV{n}_REHEAT_PCT', 'recommended', '%', 'vav', 'vav', 'Simultaneous heating/cooling detection'),
        point('Air', 'VAV', 'Occupancy Mode', 'VAV{n}_OCC_MODE', 'recommended', 'Mode', 'vav', 'vav', 'Schedule and setback analysis'),
        point('Air', 'FCU', 'Operating Status', 'FCU{n}_STATUS', 'core', '0 / 1', 'fcu', 'fcu', 'Runtime and schedule analysis'),
        point('Air', 'FCU', 'Room Temperature', 'FCU{n}_ROOM_TEMP_C', 'core', '°C', 'fcu', 'fcu', 'Comfort and terminal performance'),
        point('Air', 'FCU', 'Room Temperature Setpoint', 'FCU{n}_ROOM_TEMP_SP_C', 'core', '°C', 'fcu', 'fcu', 'Setpoint tracking and override analysis'),
        point('Air', 'FCU', 'Fan Speed / Mode', 'FCU{n}_FAN_SPEED', 'recommended', 'Mode', 'fcu', 'fcu', 'Terminal fan control and energy'),
        point('Air', 'FCU', 'CHW Valve Position', 'FCU{n}_CHW_VALVE_PCT', 'conditional', '%', 'fcu', 'fcu', 'Cooling demand and valve faults'),
        point('Air', 'FCU', 'Occupancy Mode', 'FCU{n}_OCC_MODE', 'recommended', 'Mode', 'fcu', 'fcu', 'Schedule and setback analysis'),
        point('Air', 'FCU', 'Fan Power', 'FCU{n}_FAN_POWER_KW', 'optional', 'kW', 'fcu', 'fcu', 'Terminal energy analysis'),
        point('Air', 'DX / Packaged', 'Operating Status', 'DX{n}_STATUS', 'core', '0 / 1', 'dx', 'dx', 'Runtime and staging'),
        point('Air', 'DX / Packaged', 'Compressor Status', 'DX{n}_COMP_STATUS', 'core', '0 / 1', 'dx', 'dx', 'Compressor cycling and availability'),
        point('Air', 'DX / Packaged', 'Compressor Stage / Capacity', 'DX{n}_COMP_CAP_PCT', 'recommended', '%', 'dx', 'dx', 'Part-load and staging analysis'),
        point('Air', 'DX / Packaged', 'Compressor Power', 'DX{n}_COMP_POWER_KW', 'core', 'kW', 'dx', 'dx', 'DX cooling energy'),
        point('Air', 'DX / Packaged', 'Supply Fan Speed', 'DX{n}_FAN_SPEED_PCT', 'recommended', '%', 'dx', 'dx', 'Fan control and energy'),
        point('Air', 'DX / Packaged', 'Supply Air Temperature', 'DX{n}_SAT_C', 'core', '°C', 'dx', 'dx', 'Cooling delivery'),
        point('Air', 'DX / Packaged', 'SAT Setpoint', 'DX{n}_SAT_SP_C', 'conditional', '°C', 'dx', 'dx', 'Setpoint tracking'),
        point('Air', 'DX / Packaged', 'Return Air Temperature', 'DX{n}_RAT_C', 'core', '°C', 'dx', 'dx', 'Air-side cooling performance'),
        point('Air', 'DX / Packaged', 'Economiser Mode', 'DX{n}_ECON_MODE', 'recommended', 'Mode', 'dx', 'dx', 'Economiser sequence validation'),
        point('Air', 'VRF Outdoor', 'Operating Status', 'VRFOU{n}_STATUS', 'core', '0 / 1', 'vrf', 'vrfOutdoor', 'System runtime and availability'),
        point('Air', 'VRF Outdoor', 'Power', 'VRFOU{n}_POWER_KW', 'core', 'kW', 'vrf', 'vrfOutdoor', 'VRF energy and efficiency'),
        point('Air', 'VRF Outdoor', 'Compressor Frequency', 'VRFOU{n}_COMP_HZ', 'recommended', 'Hz', 'vrf', 'vrfOutdoor', 'Modulation and part-load performance'),
        point('Air', 'VRF Outdoor', 'Capacity / Load', 'VRFOU{n}_LOAD_PCT', 'recommended', '%', 'vrf', 'vrfOutdoor', 'Capacity control and diversity'),
        point('Air', 'VRF Indoor', 'Operating Status', 'VRFIU{n}_STATUS', 'core', '0 / 1', 'vrf', 'vrfIndoor', 'Indoor-unit runtime'),
        point('Air', 'VRF Indoor', 'Room Temperature', 'VRFIU{n}_ROOM_TEMP_C', 'core', '°C', 'vrf', 'vrfIndoor', 'Zone comfort'),
        point('Air', 'VRF Indoor', 'Temperature Setpoint', 'VRFIU{n}_TEMP_SP_C', 'core', '°C', 'vrf', 'vrfIndoor', 'Zone tracking and overrides'),
        point('Air', 'VRF Indoor', 'Operating Mode', 'VRFIU{n}_MODE', 'recommended', 'Mode', 'vrf', 'vrfIndoor', 'Mode conflict and simultaneous demand'),
        point('Air', 'VRF Indoor', 'Fan Speed', 'VRFIU{n}_FAN_SPEED', 'recommended', 'Mode', 'vrf', 'vrfIndoor', 'Indoor-unit control'),
        point('Air', 'VRF Indoor', 'Expansion Valve Position', 'VRFIU{n}_EEV_PCT', 'optional', '%', 'vrf', 'vrfIndoor', 'Refrigerant-flow diagnostics'),
        point('Air', 'DOAS', 'Operating Status', 'DOAS{n}_STATUS', 'core', '0 / 1', 'doas', 'doas', 'Runtime and schedule analysis'),
        point('Air', 'DOAS', 'Outdoor Airflow', 'DOAS{n}_OA_FLOW_M3S', 'core', 'm³/s', 'doas', 'doas', 'Ventilation delivery'),
        point('Air', 'DOAS', 'Discharge Air Temperature', 'DOAS{n}_DAT_C', 'core', '°C', 'doas', 'doas', 'Conditioning performance'),
        point('Air', 'DOAS', 'Discharge Air Humidity', 'DOAS{n}_DARH_PCT', 'core', '%RH', 'doas', 'doas', 'Dehumidification performance'),
        point('Air', 'DOAS', 'Discharge Air Temperature Setpoint', 'DOAS{n}_DAT_SP_C', 'conditional', '°C', 'doas', 'doas', 'Setpoint tracking'),
        point('Air', 'DOAS', 'Supply Fan Speed', 'DOAS{n}_FAN_SPEED_PCT', 'recommended', '%', 'doas', 'doas', 'Fan and airflow control'),
        point('Air', 'DOAS', 'Supply Fan Power', 'DOAS{n}_FAN_POWER_KW', 'recommended', 'kW', 'doas', 'doas', 'Ventilation energy'),
        point('Air', 'DOAS', 'Energy Recovery Wheel Status', 'DOAS{n}_ERW_STATUS', 'conditional', '0 / 1', 'doas', 'doas', 'Heat-recovery sequence validation'),
        point('Air', 'DOAS', 'Energy Recovery Wheel Speed', 'DOAS{n}_ERW_SPEED_PCT', 'optional', '%', 'doas', 'doas', 'Heat-recovery performance'),
        point('Air', 'DOAS', 'Cooling / Heating Command', 'DOAS{n}_CAPACITY_CMD_PCT', 'recommended', '%', 'doas', 'doas', 'Conditioning control performance'),
        point('Air', 'DOAS', 'Exhaust Air Temperature', 'DOAS{n}_EXHAUST_TEMP_C', 'recommended', '°C', 'doas', 'doas', 'Energy-recovery effectiveness')
    ];

    if (analyseView) {
        const quantityMeta = [
            ['chiller', 'Chillers', 2, 'chilledWater'], ['chwp', 'CHW pumps', 2, 'chilledWater'],
            ['cwp', 'CW pumps', 2, 'waterCooled'], ['tower', 'Cooling towers', 2, 'waterCooled'],
            ['ahu', 'AHUs', 4, 'ahu'], ['vav', 'VAV boxes', 12, 'vav'], ['fcu', 'FCUs', 8, 'fcu'],
            ['dx', 'DX units', 2, 'dx'], ['vrfOutdoor', 'VRF outdoor units', 2, 'vrf'],
            ['vrfIndoor', 'VRF indoor units', 8, 'vrf'], ['doas', 'DOAS units', 1, 'doas']
        ];
        const quantities = Object.fromEntries(quantityMeta.map(([key, , value]) => [key, value]));
        const availability = {};
        let activeClass = 'all';
        let currentExpanded = [];

        const selected = key => !!analyseView.querySelector(`[data-system="${key}"]`)?.checked;
        const getConfig = () => ({
            waterCooled: selected('waterCooled'), airCooled: selected('airCooled'), dx: selected('dx'), vrf: selected('vrf'),
            ahu: selected('ahu'), vav: selected('vav'), fcu: selected('fcu'), doas: selected('doas'),
            ahuCoil: document.getElementById('ahuCoilType').value,
            distribution: analyseView.querySelector('[name="distribution"]:checked')?.value || 'variablePrimary'
        });

        const applies = (rule, c) => ({
            always: true,
            chilledWater: c.waterCooled || c.airCooled,
            waterCooled: c.waterCooled,
            airCooled: c.airCooled,
            variableFlow: (c.waterCooled || c.airCooled) && c.distribution !== 'constant',
            variablePrimary: (c.waterCooled || c.airCooled) && c.distribution === 'variablePrimary',
            primarySecondary: (c.waterCooled || c.airCooled) && c.distribution === 'primarySecondary',
            ahu: c.ahu,
            ahuChw: c.ahu && c.ahuCoil === 'chw' && (c.waterCooled || c.airCooled),
            vav: c.vav,
            fcu: c.fcu,
            dx: c.dx || (c.ahu && c.ahuCoil === 'dx'),
            vrf: c.vrf,
            doas: c.doas
        }[rule] || false);

        function renderQuantities(config) {
            const host = document.getElementById('quantityFields');
            host.innerHTML = quantityMeta.filter(([, , , rule]) => applies(rule, config)).map(([key, label]) => `
                <label class="quantity-field"><span>${label}</span><input type="number" min="1" max="500" value="${quantities[key]}" data-quantity="${key}" inputmode="numeric"></label>
            `).join('') || '<p class="quantity-empty">Select equipment to set quantities.</p>';
        }

        function expandCatalogue(config) {
            return masterCatalogue.filter(p => applies(p.applies, config)).flatMap(p => {
                const count = p.instance ? Math.max(1, quantities[p.instance] || 1) : 1;
                return Array.from({ length: count }, (_, index) => {
                    const n = index + 1;
                    const tag = p.tag.replace('{n}', n);
                    return { ...p, tag, instanceNo: p.instance ? n : null, displayName: p.instance ? `${p.module} ${n} — ${p.name}` : p.name, status: availability[tag] || 'Unknown' };
                });
            });
        }

        const requirementBadge = req => `<span class="requirement-badge requirement-${req}"><span></span>${pointClass[req].label}</span>`;

        function renderStats(points) {
            const counts = Object.fromEntries(Object.keys(pointClass).map(key => [key, points.filter(p => p.requirement === key).length]));
            document.getElementById('resultStats').innerHTML = `
                <div class="result-stat"><strong>${points.length}</strong><span>Applicable tags</span></div>
                <div class="result-stat stat-core"><strong>${counts.core}</strong><span>Must have</span></div>
                <div class="result-stat stat-recommended"><strong>${counts.recommended}</strong><span>Recommended</span></div>
                <div class="result-stat stat-derived"><strong>${counts.derived}</strong><span>Calculated</span></div>`;
            document.getElementById('allCount').textContent = points.length;
        }

        function renderTable() {
            const search = document.getElementById('pointSearch').value.trim().toLowerCase();
            const side = document.getElementById('sideFilter').value;
            const visible = currentExpanded.filter(p =>
                (activeClass === 'all' || p.requirement === activeClass) &&
                (side === 'all' || p.side === side) &&
                (!search || `${p.displayName} ${p.tag} ${p.module}`.toLowerCase().includes(search))
            );
            document.getElementById('catalogueBody').innerHTML = visible.map((p, index) => `
                <tr>
                    <td><strong>${p.displayName}</strong><small>${p.side} · ${p.module}</small></td>
                    <td><code>${p.tag}</code></td>
                    <td>${requirementBadge(p.requirement)}</td>
                    <td>${p.unit}</td>
                    <td><select class="status-select status-${p.status.toLowerCase().replaceAll(' ', '-')}" data-status-tag="${p.tag}" aria-label="Status for ${p.displayName}">
                        ${['Unknown', 'Available', 'Not Logged', 'Not Installed', 'Not Applicable'].map(status => `<option${status === p.status ? ' selected' : ''}>${status}</option>`).join('')}
                    </select></td>
                    <td><button class="why-button" type="button" data-why="${index}" aria-label="Why is ${p.displayName} needed?" title="Why do we need this point?">?</button></td>
                </tr>
                <tr class="why-row" data-why-row="${index}" hidden><td colspan="6"><strong>Why:</strong> ${p.use}<span><strong>Required when:</strong> ${ruleLabel(p.applies)}</span>${p.derivable ? `<span><strong>Calculated from:</strong> ${p.derivable}</span>` : ''}</td></tr>
            `).join('');
            document.getElementById('catalogueEmpty').hidden = visible.length > 0;
        }

        function ruleLabel(rule) {
            return ({
                always: 'All projects', chilledWater: 'A chilled-water plant is installed', waterCooled: 'A water-cooled chiller plant is installed',
                airCooled: 'An air-cooled chiller is installed', variableFlow: 'A variable-flow CHW system is installed',
                variablePrimary: 'Variable primary flow is selected', primarySecondary: 'Primary-secondary distribution is selected',
                ahu: 'AHUs are installed', ahuChw: 'AHUs use chilled-water coils', vav: 'VAV boxes are installed', fcu: 'FCUs are installed',
                dx: 'DX / packaged cooling is installed', vrf: 'VRF / VRV is installed', doas: 'DOAS units are installed'
            })[rule] || rule;
        }

        function refresh({ quantitiesOnly = false } = {}) {
            const config = getConfig();
            if (!quantitiesOnly) renderQuantities(config);
            document.getElementById('distributionGroup').classList.toggle('is-disabled', !(config.waterCooled || config.airCooled));
            currentExpanded = expandCatalogue(config);
            renderStats(currentExpanded);
            renderTable();
            const equipmentCount = quantityMeta.filter(([, , , rule]) => applies(rule, config)).reduce((sum, [key]) => sum + quantities[key], 0);
            document.getElementById('profileStateText').textContent = `${equipmentCount} equipment instances · ${currentExpanded.length} tags`;
        }

        function csvCell(value) {
            const string = String(value ?? '');
            return /[",\r\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
        }

        function downloadCsv(filename, rows) {
            const csv = '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
            const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        }

        analyseView.addEventListener('change', event => {
            if (event.target.matches('[data-system], [name="distribution"], #ahuCoilType')) refresh();
            if (event.target.matches('[data-quantity]')) {
                const key = event.target.dataset.quantity;
                quantities[key] = Math.min(500, Math.max(1, Number(event.target.value) || 1));
                event.target.value = quantities[key];
                refresh({ quantitiesOnly: true });
            }
            if (event.target.matches('[data-status-tag]')) {
                availability[event.target.dataset.statusTag] = event.target.value;
                event.target.className = `status-select status-${event.target.value.toLowerCase().replaceAll(' ', '-')}`;
                const target = currentExpanded.find(p => p.tag === event.target.dataset.statusTag);
                if (target) target.status = event.target.value;
            }
        });

        document.getElementById('catalogueBody').addEventListener('click', event => {
            const button = event.target.closest('[data-why]');
            if (!button) return;
            const row = document.querySelector(`[data-why-row="${button.dataset.why}"]`);
            row.hidden = !row.hidden;
            button.classList.toggle('active', !row.hidden);
        });

        document.getElementById('classFilters').addEventListener('click', event => {
            const button = event.target.closest('[data-class-filter]');
            if (!button) return;
            activeClass = button.dataset.classFilter;
            document.querySelectorAll('[data-class-filter]').forEach(item => item.classList.toggle('active', item === button));
            renderTable();
        });
        document.getElementById('pointSearch').addEventListener('input', renderTable);
        document.getElementById('sideFilter').addEventListener('change', renderTable);

        document.getElementById('resetProfile').addEventListener('click', () => {
            analyseView.querySelectorAll('[data-system]').forEach(input => { input.checked = ['waterCooled', 'ahu'].includes(input.dataset.system); });
            analyseView.querySelector('[name="distribution"][value="variablePrimary"]').checked = true;
            document.getElementById('ahuCoilType').value = 'chw';
            quantityMeta.forEach(([key, , value]) => { quantities[key] = value; });
            Object.keys(availability).forEach(key => delete availability[key]);
            activeClass = 'all';
            document.querySelectorAll('[data-class-filter]').forEach(item => item.classList.toggle('active', item.dataset.classFilter === 'all'));
            document.getElementById('pointSearch').value = '';
            document.getElementById('sideFilter').value = 'all';
            refresh();
        });

        document.getElementById('exportRequirements').addEventListener('click', () => {
            const headers = ['Side', 'System_Module', 'Data_Point', 'Standard_Tag', 'Requirement_Class', 'Unit', 'Applies_When', 'Instance_Rule', 'Analytics_Use', 'Derivable_From', 'Client_Status'];
            const rows = currentExpanded.map(p => [p.side, p.module, p.displayName, p.tag, pointClass[p.requirement].csv, p.unit, ruleLabel(p.applies), p.instance ? `${p.instance}{n} expanded to ${p.instanceNo}` : 'One per site/system', p.use, p.derivable, p.status]);
            downloadCsv('Retragreen_Client_Data_Requirement.csv', [headers, ...rows]);
        });

        document.getElementById('exportTemplate').addEventListener('click', () => {
            const included = currentExpanded.filter(p => p.requirement !== 'derived' && !['Not Installed', 'Not Applicable'].includes(p.status));
            downloadCsv('Retragreen_Historical_Data_Template.csv', [['Timestamp', ...included.map(p => p.tag)], ['YYYY-MM-DD HH:MM:SS', ...included.map(() => '')]]);
        });

        // Support direct links and browser navigation without changing the existing visual router.
        function openHashView() {
            const id = location.hash.slice(1);
            if (!id || !document.getElementById(id)?.classList.contains('view')) return;
            navItems.forEach(item => item.classList.toggle('active', item.dataset.view === id));
            views.forEach(view => view.classList.toggle('active', view.id === id));
        }
        window.addEventListener('hashchange', openHashView);
        openHashView();
        refresh();
    }

    console.log('RG Data Requirement app initialized');
});
