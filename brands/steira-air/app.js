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
            title: "Johnson Controls Metasys — BACnet Point List Export",
            wide: true,
            footer: "Send the device sheet + point list to info@steiraair.com · Questions: info@steiraair.com",
            blocks: [
                {
                    type: 'lead',
                    text: "Written for the site BMS engineer. This guide covers the <strong>point list / point mapping</strong> export — the sheet that tells us which BACnet object holds which measurement. We need it <em>before</em> any historical data is collected: a trend file without a point list cannot be interpreted."
                },
                {
                    type: 'note',
                    title: "Two different exports — send the right one",
                    text: "<strong>(1) Point list / point mapping</strong> — which points exist, where they live, what they mean, how they are addressed. This guide. <strong>(2) Historical trend data</strong> — the values over time, see section 7. A trend export cannot replace the point list: it carries no object identifiers, so we cannot map it back to equipment."
                },
                {
                    type: 'section',
                    title: "1 · What we need you to send",
                    blocks: [
                        {
                            type: 'table',
                            columns: ['Deliverable', 'Content', 'Why we need it'],
                            rows: [
                                ['<strong>A · Device &amp; network sheet</strong>', 'One row per BACnet device — identity and addressing (1.1)', 'Tells us who to talk to, and whether the points are reachable from outside the BMS'],
                                ['<strong>B · Point list / point mapping</strong>', 'One row per point — name, object type, instance, units, read/write, purpose (1.2)', 'The mapping our data platform uses to name, unit and validate every series']
                            ]
                        },
                        {
                            type: 'section',
                            title: '1.1 · Device &amp; network sheet — one row per device',
                            blocks: [
                                {
                                    type: 'table',
                                    columns: ['Field', 'Where to find it in Metasys', 'Example'],
                                    rows: [
                                        ['Site name', 'Navigation Tree / Site Object', 'HQ — Tower A'],
                                        ['Device Object Name', 'BACnet Device object → Object Name attribute', 'NAE-01'],
                                        ['Device Instance (BACnet Object Identifier)', 'Device object → Instance (select <strong>Advanced</strong> on the Focus / Network tab)', 'Device, 12'],
                                        ['Vendor ID / Vendor Name', 'BACnet Device object attributes (AShRAE vendor code)', '17 / Johnson Controls'],
                                        ['Model Name', 'BACnet Device object attribute', 'NAE8500'],
                                        ['Firmware Revision / Application Software Version', 'BACnet Device object attributes', '12.0.8 / 4.2'],
                                        ['BACnet IP address &amp; UDP port', 'Device object → BACnet IP Port (Advanced view)', '10.20.30.40 / 47808'],
                                        ['Protocol Version / Services / Object Types supported', 'BACnet Device object attributes', 'Rev 19 / COV, ReadProperty…'],
                                        ['BBMD (only if on another subnet)', 'Site Object → BACnet section → third-party BBMD attribute', '10.20.31.1'],
                                        ['Number of exposed objects', 'Advanced Search result count (section 2)', '1,284']
                                    ]
                                },
                                {
                                    type: 'note',
                                    text: "The BACnet Device object holds the external, visible characteristics of a device, and only one Device object exists in each BACnet device. The Johnson Controls network engine device object also carries attributes and methods beyond the standard set — in the software its object type is labelled <strong>Non-FEC BACnet Device</strong>."
                                }
                            ]
                        },
                        {
                            type: 'section',
                            title: '1.2 · Point list columns — one row per point',
                            blocks: [
                                {
                                    type: 'table',
                                    columns: ['Column', 'Meaning', 'Where it comes from', 'Priority'],
                                    rows: [
                                        ['Tag (our name)', 'The name we will use in the data platform', 'You assign it', 'Required'],
                                        ['Object Name (native)', 'BACnet Object Name held in the device', 'Advanced Search → Name/Label', 'Required'],
                                        ['Object Type', 'Analog Input / Output, Binary Input / Output, Multi-state, Trend Log, Schedule…', 'Advanced Search → Type', 'Required'],
                                        ['Instance Number', 'Instance part of the BACnet Object Identifier', 'Point Configuration → Hardware tab (SCT), or Advanced view', 'Required for BACnet'],
                                        ['Item Reference', 'Unique Metasys reference of the object', 'Advanced Search → Item Reference', 'Required'],
                                        ['Description', 'What the point measures or controls', 'Advanced Search → Description', 'Required'],
                                        ['Units', 'Engineering units (°C, kW, m³/h, %RH)', 'Advanced Search → Units', 'Required'],
                                        ['Read / Write', 'Whether we may only read, or are also allowed to command', 'Point properties / your policy', 'Required'],
                                        ['Present value &amp; status', 'Sanity check that the point is alive and not Out of Service', 'Advanced Search → Value, Status', 'Recommended'],
                                        ['Space / Equipment', 'Grouping used to label the series', 'Advanced Search → Spaces and Equipment', 'Recommended'],
                                        ['Trend available?', 'Historical logging yes/no, plus interval', 'Trend log objects / your policy', 'Recommended'],
                                        ['Point source', 'native / integrated / derived-virtual', 'Your confirmation', 'Recommended']
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '2 · Method A — Metasys UI (Release 12.1 and later) ★ use this if you have it',
                    blocks: [
                        {
                            type: 'steps',
                            items: [
                                "Open Metasys UI on a PC. Data export is not supported on tablets or smartphones.",
                                "Open the <strong>User menu</strong> → <strong>Advanced Search &amp; Reporting</strong>.",
                                "Build the search with the five filters: Space &amp; Equipment, Name/Label, Object Type, Equipment Definition, Search Locations. Wildcards work, e.g. Name/Label <code>*CHW*</code>.",
                                "Leave <strong>Exclude Extensions</strong> clear to also list trend, alarm, totalization, load and averaging objects; tick it when you want the points only.",
                                "Run the search, then click the <strong>Export</strong> button to write a <code>.csv</code>. Select rows first if you only want part of the result.",
                                "Repeat per system (water / air / electrical) and per site. Save as <code>SiteName_PointList_YYYYMMDD.csv</code>, UTF-8.",
                                "On Servers you can also export PDF and schedule reports: select the results → ACTIONS → Create Report → Report Type, Date Range, Format → Download immediately or Send to an email address / network location → set Repeat. Saved searches remain available on the Saved From Search tab."
                            ]
                        },
                        {
                            type: 'note',
                            title: 'What this CSV does not contain',
                            tone: 'warn',
                            text: "The export contains exactly the results columns — Type, Name/Label, Item Reference, Value, Units, Status, Description, Authorization Category, Spaces and Equipment. It does <strong>not</strong> carry the BACnet object instance. Add that column yourself from the point configuration (section 4, step 4), otherwise we cannot address the point over BACnet."
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '3 · Method B — BACnet Workstation ODS / Site Management Portal (Metasys 8.x – 11.x)',
                    blocks: [
                        {
                            type: 'steps',
                            items: [
                                "Log in to the Site Management Portal, or to BACnet Workstation ODS on the ODS server.",
                                "<strong>Queries → Global Search</strong>. Set Object Type to <strong>All (except extensions)</strong>, add your criteria, then click Search.",
                                "The Search Results table is your object list. To keep it, right-click the Global Search Viewer title bar — or use <strong>Queries → Save Object List</strong> — give it a unique Name, choose the Category, then Save. The list is stored on the Site Director, not as a spreadsheet.",
                                "To get a spreadsheet: select the rows in the Search Results table, copy to the clipboard and paste into Excel — or print the Search Results table. Object list files live in <code>C:\\ProgramData\\Johnson Controls\\MetasysIII\\File Transfer\\Object Lists</code>.",
                                "Re-use the saved object list for scheduled reports and global commands instead of re-running the search every time."
                            ]
                        },
                        {
                            type: 'note',
                            title: 'Object lists are not backed up',
                            tone: 'warn',
                            text: "Object lists are not saved when the database is backed up, and they are deleted when the database is restored — keep your own copy of the list file. Sorting order is not stored in the object list either."
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '4 · Method C — SCT: structure export and mapping check',
                    blocks: [
                        {
                            type: 'steps',
                            items: [
                                "Open the site archive database in SCT. SCT edits the archive copy — it never changes the live system directly.",
                                "Confirm BACnet is exposed: right-click the <strong>Site Object</strong> → <strong>View</strong> → in the Site View click <strong>Advanced</strong> on the right, click <strong>Edit</strong> on the left and scroll to the BACnet section (visible only with Advanced selected) → set <strong>BACnet Site</strong> = True and the <strong>BACnet Encoding Type</strong> used by the BACnet devices → <strong>Save</strong>.",
                                "Export the point structure: in the navigation tree select the source item — it must sit below the Site object, since a whole site cannot be exported as one item — then <strong>Item menu → Export Item</strong>, enter a unique file name and click Finish. The file is written to <code>C:\\ProgramData\\Johnson Controls\\MetasysIII\\DatabaseFiles</code>. Note the Reference, Class and Class Version shown in the Notice Information dialog; the export does not change the instance number, host name or IP address of a device.",
                                "Read the BACnet instance numbers: for each point, the <strong>Instance Number</strong> on the Configuration screen's <strong>Hardware</strong> tab must match the instance of the BACnet Object Identifier in the host BACnet device. Click <strong>Advanced</strong> to see the full BACnet object identifier.",
                                "Map or remap points where needed: <strong>Insert → Field Points</strong> → select the BACnet device → Next → <strong>Assisted</strong> → <strong>Invoke Auto Discovery</strong>. The supervisory controller must be online with the devices on the BACnet/IP network. Auto discovery fills the Native Object Name from the BACnet Object Name and the Instance Number from the BACnet Object Identifier; double-click points individually or use <strong>Map All</strong> → Next → Finish. When working offline choose <strong>Manual</strong> and enter the object type and instance instead.",
                                "If a value you need does not exist as a native BACnet object, it has to be created in Metasys first — for example with Logic Connector Tool logic blocks (Bool category: AND 2–8, OR 2–8, XOR 2, NOT 1, LTCH latch, plus the arithmetic and timing categories) — and then mapped as a field point. Mark such rows <strong>derived / virtual</strong> in the point list."
                            ]
                        },
                        {
                            type: 'note',
                            text: "SCT exports are Metasys archive items, not spreadsheets. Use them to review structure and mapping; the handover file is still the CSV point list."
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '5 · Eight checks before you send it',
                    blocks: [
                        {
                            type: 'checklist',
                            items: [
                                "Every BACnet Object Identifier on the network is unique, including the one of the supervisory controller itself. Check the Duplicate Device Identifiers attribute on the BACnet Integration object (Diagnostic view).",
                                "BACnet Site = True on the Site Object, and the BACnet Encoding Type matches the BACnet devices in the field.",
                                "<strong>BACnet Integrated Objects</strong> = Include in Object List, if we must read third-party points that Metasys has integrated (BACnet Routing section of the device object: Focus tab on Servers, Network tab on engines).",
                                "<strong>Routing Mode</strong> = Enabled Without Broadcasts on routed networks, so third-party devices outside the network do not discover routed devices by broadcast and end up seeing each object twice.",
                                "A BBMD exists for every subnet that is not the supervisory controller segment, and its IP is in the third-party BBMD attribute of the Site object.",
                                "The field devices answer the Who-Is service — auto discovery cannot see devices that do not.",
                                "Units, Description and read/write status are filled in. We cannot derive them, and wrong units silently ruin the analysis.",
                                "Trend availability is confirmed per point (yes/no plus interval) — otherwise we plan to poll every 5–15 minutes."
                            ]
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '6 · Troubleshooting',
                    blocks: [
                        {
                            type: 'table',
                            columns: ['Symptom', 'Likely cause', 'Fix'],
                            rows: [
                                ['Auto discovery finds no or few devices', 'BACnet Network Address or BACnet IP Port mismatch; wrong MS/TP Network Address', 'Match the BACnet IP Port on the device object (Advanced view) and the MS/TP Network Address on the Hardware tab'],
                                ['Auto discovery returns duplicate devices', 'Two devices share a BACnet Object Identifier', 'Read Duplicate Device Identifiers on the BACnet Integration object (Diagnostic view) and renumber the duplicates'],
                                ['Devices on another subnet stay invisible', 'No BBMD for that segment', 'Add the BBMD device IP to the third-party BBMD attribute of the Site object'],
                                ['A device never appears in discovery', 'It does not support Who-Is, or a discovery filter blocks it', 'Map it manually, or use a BACnet browser, and review any discovery filter settings'],
                                ['A third-party client sees the same point twice', 'BACnet Integrated Objects = Include in Object List together with Routing Mode = Enabled', 'Set Routing Mode to Enabled Without Broadcasts'],
                                ['A point is visible in Metasys but not from outside', 'BACnet Integrated Objects = Exclude from Object List, or no read access / point is Out of Service', 'Set Include in Object List, clear Out of Service and confirm read permission'],
                                ['Export button does nothing', 'Running on a tablet or phone', 'Repeat the export from a PC'],
                                ['Point reads fail after manual mapping', 'Instance Number entered on the wrong tab, or not matching the host device', 'Re-enter it on the Configuration screen Hardware tab and verify with Advanced']
                            ]
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '7 · Historical trend data (separate deliverable)',
                    blocks: [
                        {
                            type: 'steps',
                            items: [
                                "Log into the Metasys Site Management Portal (SMP).",
                                "Use the 'Trend Study' tool to select your points.",
                                "Define the time range for historical data (last 12 months minimum).",
                                "Click 'Export' and select 'Comma Separated Values' (CSV).",
                                "Ensure date/time formatting is consistent (YYYY-MM-DD HH:MM).",
                                "Download the generated file."
                            ]
                        },
                        {
                            type: 'note',
                            text: "For long histories, the Metasys Export Utility extracts trend, alarm and audit data from the Network Engine or ADS/ADX into Microsoft Excel (.xls) or Access (.mdb) files, immediately or on a schedule — use it instead of repeated manual exports."
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '8 · Official Johnson Controls references',
                    blocks: [
                        {
                            type: 'refs',
                            items: [
                                {
                                    label: 'BACnet Device Attributes — SCT Help 17.1 (LIT-12011964)',
                                    url: 'https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/SCT-System-Configuration-Tool-Help/17.1/Insert-Menu/Field-Device/BACnet-Device-Object/BACnet-Device-Attributes'
                                },
                                {
                                    label: 'BACnet Device Object — SCT Help 17.1 (LIT-12011964)',
                                    url: 'https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/SCT-System-Configuration-Tool-Help/17.1/Insert-Menu/Field-Device/BACnet-Device-Object'
                                },
                                {
                                    label: 'Bool Category (logic blocks) — SCT Help 16.0 (LIT-12011964)',
                                    url: 'https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/SCT-System-Configuration-Tool-Help/16.0/Insert-Menu/Program-Object/Logic-Connector-Tool-LCT/Logic-Connector-Tool-Concepts/Logic/Logic-Blocks/Bool-Category'
                                },
                                {
                                    label: 'Exposing BACnet information — BACnet Controller Integration TB 15.0 (LIT-1201531)',
                                    url: 'https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/BACnet-Controller-Integration-Technical-Bulletin/15.0/Detailed-procedures/Exposing-BACnet-information'
                                },
                                {
                                    label: 'Mapping BACnet Field Points using Auto Discovery — TB 14.1 (LIT-1201531)',
                                    url: 'https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/BACnet-Controller-Integration-Technical-Bulletin/14.1/Detailed-procedures/Mapping-BACnet-Field-Points-using-Auto-Discovery'
                                },
                                {
                                    label: 'Mapping BACnet Field Points manually — TB 15.0 (LIT-1201531)',
                                    url: 'https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/BACnet-Controller-Integration-Technical-Bulletin/15.0/Detailed-procedures/Mapping-BACnet-Field-Points-manually'
                                },
                                {
                                    label: 'BACnet System Integration troubleshooting guide — TB 14.0 (LIT-1201531)',
                                    url: 'https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/BACnet-Controller-Integration-Technical-Bulletin/14.0/Troubleshooting/BACnet-System-Integration-troubleshooting-guide'
                                },
                                {
                                    label: 'BACnet Integrated Objects attribute — Metasys UI Help 15.0 (LIT-12011953)',
                                    url: 'https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/Metasys-UI-Help/15.0/Metasys-UI-and-BACnet-Advanced-Operator-Workstation/Managing-BACnet-devices-and-networks/BACnet-Integrated-Objects-attribute-in-Server-or-engine-device-objects'
                                },
                                {
                                    label: 'Advanced Search — Metasys UI Help 7.0 (LIT-12011953)',
                                    url: 'https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/Metasys-UI-Help/7.0/Navigating-and-searching/Advanced-search-reporting-bulk-commanding-and-bulk-modifying/Advanced-Search'
                                },
                                {
                                    label: 'Export Item — SCT Help 14.1 (LIT-12011964)',
                                    url: 'https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/SCT-System-Configuration-Tool-Help/14.1/Item-Menu/Export-Item'
                                },
                                {
                                    label: 'Saving an Object List — Site Management Portal Help 11.0 (LIT-1201793)',
                                    url: 'https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/Metasys-Site-Management-Portal-Help/11.0/Query-Menu/Saving-an-Object-List'
                                }
                            ]
                        }
                    ]
                }
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
        },
        trane: {
            title: "Trane Tracer Summit Trend Data Export Guide",
            steps: [
                "Log on to the Tracer Summit PC Workstation and open the required site. Confirm that your user profile has access to the Trend Viewer.",
                "Open the Trend Viewer from the toolbar. Alternatively, go to 'Setup' > 'Trend Viewer', then select the required Trend Viewer object.",
                "Confirm that the required HVAC points are included as Trend Viewer members. A Trend Viewer can display up to 10 properties; use additional viewers or exports when more points are required.",
                "Click 'Select Range'. Set the required 'From' and 'To' date and time, then click 'OK' to load that historical range.",
                "From the 'File' menu, select the CSV export option to save the current trend data as a comma-separated value file. Do not use the toolbar image-save button, which saves only BMP, JPEG, or PNG graphics.",
                "Name the file using the building, equipment, and date range, then open it in Excel or a text editor and verify timestamps, point names, engineering units, and values before submission.",
                "If the required history is unavailable, ask the site administrator to confirm harvested-trend retention. Audit Trail historical trending requires a registered Tracer Summit CCS or Enterprise package and an online connection."
            ]
        }
    };

    // Modal Logic
    const modal = document.getElementById('bmsModal');
    const modalBody = document.getElementById('modalBody');
    const modalPanel = document.querySelector('.modal-content');
    const bmsCards = document.querySelectorAll('.bms-card');
    const closeModal = document.querySelector('.close-modal');

    // ── Shared modal opener ──────────────────────────────────────────────────
    function openModal(html, wide = false) {
        modalBody.innerHTML = html;
        if (modalPanel) {
            modalPanel.classList.toggle('is-wide', !!wide);
            modalPanel.scrollTop = 0;
        }
        modal.style.display = 'block';
    }

    // ── Guide block renderer (for guides that need tables, notes, checklists) ─
    function renderBlocks(blocks) {
        return blocks.map(block => {
            switch (block.type) {
                case 'lead':
                    return `<p class="guide-lead">${block.text}</p>`;
                case 'section':
                    return `<div class="modal-section">${block.title ? `<div class="modal-section-title">${block.title}</div>` : ''}${renderBlocks(block.blocks || [])}</div>`;
                case 'steps':
                    return `<ol>${block.items.map(item => `<li><span class="guide-li">${item}</span></li>`).join('')}</ol>`;
                case 'bullets':
                    return `<ul>${block.items.map(item => `<li><span class="guide-li">${item}</span></li>`).join('')}</ul>`;
                case 'checklist':
                    return `<ul class="guide-check">${block.items.map(item => `<li><span class="guide-li">${item}</span></li>`).join('')}</ul>`;
                case 'note':
                    return `<div class="guide-note${block.tone === 'warn' ? ' is-warn' : ''}">${block.title ? `<strong>${block.title}</strong>` : ''}<p>${block.text}</p></div>`;
                case 'table':
                    return `<div class="guide-table-wrap"><table class="guide-table"><thead><tr>${block.columns.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${block.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
                case 'refs':
                    return `<ul class="guide-refs">${block.items.map(ref => `<li>${ref.label} — <a href="${ref.url}" target="_blank" rel="noopener noreferrer">${ref.url}</a></li>`).join('')}</ul>`;
                default:
                    return '';
            }
        }).join('');
    }

    // ── Render a BMS guide: rich block layout, or the legacy numbered steps ───
    function renderGuide(data) {
        const body = data.blocks
            ? renderBlocks(data.blocks)
            : `<ol>${(data.steps || []).map(step => `<li>${step}</li>`).join('')}</ol>`;
        const footer = data.footer || 'Need help? Contact info@steiraair.com';
        return `<h2 class="accent-text">${data.title}</h2>${body}<div class="modal-footer">${footer}</div>`;
    }

    // ── BMS Detailed Guides ──────────────────────────────────────────────────
    bmsCards.forEach(card => {
        card.addEventListener('click', () => {
            const data = bmsData[card.getAttribute('data-bms')];
            if (!data) return;
            openModal(renderGuide(data), data.wide);
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
                        "BMS Brand (Honeywell / Siemens / Johnson Controls / Schneider / Tridium / Trane / Other)",
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
            <div class="modal-footer">Fill in the Data Collection Form (Sheet corresponds to this section) and email to info@steiraair.com</div>
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
            items: ['Auto-compiled data package summary', 'Attached: completed Data Collection Form', 'Attached: historical CSV files (zipped)', 'Send to: info@steiraair.com']
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
