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
            const isDrawerNode = key === 'analyse-water' || key === 'analyse-air' || key === 'bms-water' || key === 'bms-air';

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

    console.log('RG Data Requirement app initialized');
});
