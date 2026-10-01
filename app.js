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
        networkscan: {
            title: "Connect &amp; Scan — Set Your IP into the BMS Range, Then Scan with YABE",
            wide: true,
            footer: "Send the device sheet + object list to data@retragreen.com · Questions: support@retragreen.com",
            blocks: [
                {
                    type: 'lead',
                    text: "Written for the site engineer or IT contact who has to get a laptop onto the building network. This is <strong>vendor-neutral</strong> — it works for Honeywell, Siemens, Johnson Controls and Schneider alike, because every BACnet system answers the same discovery request on the same port. Do this <em>before</em> the vendor-specific guides: the point list you produce here is the part those exports cannot give you."
                },
                {
                    type: 'note',
                    tone: 'warn',
                    title: 'Before you touch anything — five rules',
                    text: "<strong>1.</strong> Get written permission from the BMS contractor or the site manager; touching a live building network without it is your liability. <strong>2.</strong> <em>Read only.</em> Never write to a BACnet object on a production site — one stray write to an Analog Output can start a chiller. <strong>3.</strong> Never unplug a network cable you did not plug in. <strong>4.</strong> Switch off Wi-Fi, VPN and any second Ethernet adapter before you start; three of them will silently break discovery. <strong>5.</strong> Put the laptop IP back to Automatic (DHCP) before you hand it on."
                },
                {
                    type: 'note',
                    title: 'About the pictures',
                    text: "The diagrams below are <strong>schematics redrawn for teaching</strong>, not screen captures — they are laid out for clarity and the spacing is simplified, but every field name, button label and menu path is the real one. Your Windows build and YABE version will differ in detail and in skin; if a label does not match, trust the field name, not the pixel position."
                },

                // ── 1 · what you need ────────────────────────────────────
                {
                    type: 'section',
                    title: '1 · What you need before you start',
                    blocks: [
                        {
                            type: 'table',
                            columns: ['Item', 'Why', 'Notes'],
                            rows: [
                                ['Windows 10 or 11 laptop', 'The machine that joins the BMS network', 'Any laptop will do. A USB-to-Ethernet adapter is worth carrying — thin built-in ports are the most common reason a cable will not fit'],
                                ['Cat5e/Cat6 patch cable', 'Physical link to the BMS switch or panel', 'Do <em>not</em> use a crossover cable — modern switches auto-negotiate, but a crossover on an unmanaged switch is a silent failure'],
                                ['The BMS IP address list', 'Tells you the subnet, the range and which IPs are taken', 'Ask the BMS engineer. The quickest source is <code>ipconfig</code> on the BACnet workstation itself (section 2)'],
                                ['An unused IP in that range', 'The address you will give your laptop', 'Never assume .250 is free — check the IP list first'],
                                ['YABE (Yet Another BACnet Explorer)', 'The scanning tool — free, runs on Windows, reads BACnet/IP, MS/TP and PTP', 'Download in section 7'],
                                ['USB-to-RS485 adapter', '<strong>Only if</strong> the trunk is BACnet MS/TP', 'FTDI or CH340 based, preferably galvanically isolated. YABE is tested with FTDI adapters'],
                                ['A switch port on the BMS network', 'Where you plug in', 'An office wall socket is usually a separate VLAN and will not see the BACnet devices']
                            ]
                        },
                        {
                            type: 'note',
                            title: 'Do I have BACnet/IP or MS/TP?',
                            text: "This decides which half of the guide you use. <strong>BACnet/IP</strong> runs over Ethernet — every device has an IP address, and you configure your laptop the same way as the rest of this guide (sections 2&ndash;8). <strong>MS/TP</strong> (also called ARCNET, MSTP or RS-485) is a serial bus with no IP addresses at all — skip straight to section 9. Most modern sites are BACnet/IP, often with MS/TP devices hanging off a gateway."
                        }
                    ]
                },

                // ── 2 · plan the address ──────────────────────────────────
                {
                    type: 'section',
                    title: '2 · Plan the address before you open Settings',
                    blocks: [
                        {
                            type: 'figure',
                            src: 'assets/bms-network/01-network-topology.svg',
                            alt: 'Diagram: the laptop, an unmanaged switch and three BACnet devices all inside the BMS subnet 10.20.30.0/24, with a callout on what happens across a router or a VPN',
                            caption: 'The whole principle in one picture — your laptop joins the same subnet as the devices, with <em>no</em> default gateway.'
                        },
                        {
                            type: 'steps',
                            items: [
                                "<strong>Find the BMS range.</strong> The most reliable source is the BACnet workstation: open PowerShell on it and run <code>ipconfig</code>. The <code>IPv4 Address</code> and <code>Subnet Mask</code> of its Ethernet adapter give you the exact range and mask the BMS uses.",
                                "<strong>List what is already taken.</strong> The same <code>ipconfig</code> gives you one address. For the full list, ask the engineer for the BACnet network sheet or the IP schedule — that is the document that also lists BBMD and foreign device settings later on.",
                                "<strong>Choose a free address for yourself.</strong> Pick something well away from the network and gateway addresses — commonly <code>.200</code> to <code>.250</code> — and confirm it is not on the list. Do <em>not</em> reuse the workstation IP, and never use the network or broadcast address.",
                                "<strong>Leave the gateway blank.</strong> This is the single most common mistake. If you fill in the office router (<code>192.168.1.1</code> is typical), Windows starts routing your BACnet broadcasts and the scan returns nothing. On a single subnet you do not need a gateway at all.",
                                "<strong>Note the mask exactly as the site uses it.</strong> Do not assume /24."
                            ]
                        },
                        {
                            type: 'table',
                            columns: ['Subnet mask', 'Prefix', 'Usable range on 10.20.30.x', 'Comment'],
                            rows: [
                                ['255.255.255.0', '/24', '.1 – .254', 'Most BMS networks. Also what most people assume when the site uses something else'],
                                ['255.255.255.128', '/25', '.1 – .126', 'Two half-subnets. Getting this wrong looks exactly like &ldquo;some devices appear, some don&rsquo;t&rdquo;'],
                                ['255.255.0.0', '/16', '.0.1 – .254.254', 'Large, flat network. Fine, but the broadcast domain is huge and scans get slow'],
                                ['255.255.254.0', '/23', '10.20.30.1 – 10.20.31.254', 'Common in sites split across two racks — the mask crosses an octet, which is where people mis-set it']
                            ]
                        },
                        {
                            type: 'note',
                            title: 'Why no default gateway at all?',
                            text: "BACnet discovery is a UDP <em>broadcast</em> to 255.255.255.255 on port 47808. A router does not forward broadcasts, so once a gateway is configured and the OS decides the target is &ldquo;off-link&rdquo;, the packet never reaches the BMS segment. Keeping the gateway empty forces Windows to treat the whole segment as directly connected. If the site genuinely runs multiple BACnet subnets, discovery across them is the job of a <strong>BBMD</strong> (BACnet Broadcast Management Device) plus a foreign-device registration — that is an engineer task, not a laptop setting."
                        },
                        {
                            type: 'note',
                            tone: 'warn',
                            title: 'Kill the other routes before you start',
                            text: "<strong>Turn off Wi-Fi</strong> (an office Wi-Fi network will keep its own default gateway and win the route to some addresses), <strong>disconnect the VPN</strong>, and <strong>disable any unused Ethernet adapters</strong>. If YABE has more than one adapter available it may bind the wrong one. Same for hypervisors: a VirtualBox / VMware / Hyper-V virtual adapter on a different segment can absorb the broadcast."
                        }
                    ]
                },

                // ── 3 · Windows 11 ────────────────────────────────────────
                {
                    type: 'section',
                    title: '3 · Windows 11 — set a static IPv4 address',
                    blocks: [
                        {
                            type: 'figure',
                            src: 'assets/bms-network/02-win11-manual-ip.svg',
                            alt: 'Windows 11 Settings showing Ethernet IP assignment switched to Manual, with IPv4 address, subnet mask and the gateway field deliberately left empty',
                            caption: 'Windows 11: Settings &#8250; Network &amp; internet &#8250; Ethernet &#8250; IP assignment &#8250; Edit &#8250; Manual.'
                        },
                        {
                            type: 'steps',
                            items: [
                                "Open <strong>Settings &#8250; Network &amp; internet</strong> and click <strong>Ethernet</strong> on the left.",
                                "Scroll to <strong>IP assignment</strong> and click <strong>Edit</strong>. The current value is usually <em>Automatic (DHCP)</em>, and it shows you the address the office network handed out — that one is almost certainly <em>wrong</em> for the BMS.",
                                "Change the IP type to <strong>Manual</strong>, then click <strong>IPv4</strong> (or <strong>IPv4</strong> and <strong>IPv6</strong> if the flyout asks for both). Leave IPv6 on <strong>Automatic (DHCP)</strong> — BACnet does not use it.",
                                "Fill in <strong>IP address</strong> (section 2, your free address), <strong>Subnet mask</strong> (copied from the BMS workstation), and leave <strong>Gateway</strong> and <strong>Preferred DNS</strong> <em>completely empty</em>.",
                                "Click <strong>Save</strong>, then unplug and replug the cable. Windows applies the change immediately, but a replug guarantees a clean ARP cache on the segment."
                            ]
                        },
                        {
                            type: 'note',
                            title: 'Same result, faster, on any Windows',
                            text: "Press <strong>Win + R</strong>, type <code>ncsi.cpl</code> and press Enter. This opens the classic <em>Network Connections</em> list in one step, from which you go straight to section 4 &mdash; the dialog is the same on Windows 10, 11 and Windows Server. If you only remember one route, remember this one."
                        }
                    ]
                },

                // ── 4 · Windows 10 ────────────────────────────────────────
                {
                    type: 'section',
                    title: '4 · Windows 10 — the same thing, classic dialogs',
                    blocks: [
                        {
                            type: 'figure',
                            src: 'assets/bms-network/03-win10-ipv4-properties.svg',
                            alt: 'Windows 10 Network Connections list showing an APIPA address, the right-click Properties menu, and the Internet Protocol Version 4 properties dialog with a static address',
                            caption: 'Windows 10: Network Connections &#8250; right-click Ethernet &#8250; Properties &#8250; Internet Protocol Version 4.'
                        },
                        {
                            type: 'steps',
                            items: [
                                "Open <strong>Control Panel &#8250; Network and Internet &#8250; Network Connections</strong>, or press <strong>Win + R</strong> and run <code>ncsi.cpl</code>.",
                                "Read what is there now. On a BMS network the Ethernet adapter will usually show <code>169.254.x.x</code> with a /16 prefix — that is Windows assigning itself an <strong>APIPA</strong> address because it asked for DHCP and nobody answered. That is the normal starting point, and it is why the scan finds nothing until you set a real address.",
                                "Right-click <strong>Ethernet</strong> &#8250; <strong>Properties</strong>. Untick <em>Internet Protocol Version 6</em> if you want to keep things simple, or leave it &mdash; it is harmless.",
                                "Select <strong>Internet Protocol Version 4 (TCP/IPv4)</strong> &#8250; <strong>Properties</strong>.",
                                "Clear <strong>Obtain an IP address automatically</strong> and <strong>Obtain a DNS server address automatically</strong>, select <strong>Use the following IP address</strong>, and enter the address and mask from section 2.",
                                "Leave <strong>Default gateway</strong> empty. Leave both DNS boxes empty. Leave <strong>Validate settings at exit</strong> ticked and the <strong>WINS</strong> tab untouched &mdash; BACnet uses neither.",
                                "Click <strong>OK</strong>, then <strong>OK</strong> again to close the adapter dialog."
                            ]
                        },
                        {
                            type: 'note',
                            tone: 'warn',
                            title: 'Expect to be asked for administrator rights',
                            text: "Changing an Ethernet adapter normally does not require elevation, but the <em>Control Panel</em> path can trigger UAC depending on policy. If the dialog is greyed out, you are not running as an administrator &mdash; close it, right-click PowerShell and choose <em>Run as administrator</em>."
                        }
                    ]
                },

                // ── 5 · verify ────────────────────────────────────────────
                {
                    type: 'section',
                    title: '5 · Verify the link before you open YABE',
                    blocks: [
                        {
                            type: 'figure',
                            src: 'assets/bms-network/04-verify-cli.svg',
                            alt: 'PowerShell output: ipconfig showing 10.20.30.200 with a blank gateway, a successful ping, and arp -a listing three BACnet devices on the subnet',
                            caption: 'Three commands that tell you in ten seconds whether the addressing is right.'
                        },
                        {
                            type: 'table',
                            columns: ['Command', 'What a healthy result looks like', 'If it does not'],
                            rows: [
                                ['<code>ipconfig</code>', 'Your chosen address, the right mask, <strong>no default gateway</strong>', 'Still <code>169.254.x.x</code>? The static change did not take &mdash; reapply it and replug the cable'],
                                ['<code>ping 10.20.30.40</code>', 'Four replies, 0% loss', 'A failed ping means <em>nothing</em> on its own &mdash; ICMP is often blocked. Go to section 11 only if YABE also comes back empty'],
                                ['<code>arp -a</code>', 'A row for each BMS device on your subnet', 'Empty or only your own address means you are on the wrong segment, or the devices are down'],
                                ['<code>Get-NetAdapter</code>', 'The Ethernet adapter shows <code>Up</code>', 'A cable, a dead switch port or a disabled adapter'],
                                ['<code>Get-NetIPAddress -InterfaceAlias &quot;Ethernet&quot;</code>', 'Your address is listed', 'Confirms Windows actually committed the setting']
                            ]
                        },
                        {
                            type: 'note',
                            title: 'Two things that look like failures and are not',
                            text: "<strong>A dead ping is not proof of a problem.</strong> Ping uses ICMP, which building networks commonly block. BACnet/IP uses UDP 47808, so YABE can scan a network that answers no pings at all. <strong>Test-NetConnection is the wrong tool.</strong> It tests TCP only, so <code>TcpTestSucceeded : False</code> against port 47808 is expected and tells you nothing. The YABE device list is the only verdict that counts."
                        }
                    ]
                },

                // ── 6 · firewall ──────────────────────────────────────────
                {
                    type: 'section',
                    title: '6 · Let UDP 47808 through Windows Defender Firewall',
                    blocks: [
                        {
                            type: 'figure',
                            src: 'assets/bms-network/05-firewall-udp-47808.svg',
                            alt: 'Windows Defender Firewall allowing an app through, with Yabe ticked for private networks only, and an inbound rule specifying UDP port 47808',
                            caption: 'The simple dialog is usually enough &mdash; but the inbound rule is the one that survives a Windows update.'
                        },
                        {
                            type: 'note',
                            tone: 'warn',
                            title: 'Why this step is skipped more often than any other',
                            text: "A machine with a good static IP, a working cable and a live BMS will still discover <strong>zero devices</strong> if Windows Defender Firewall blocks the UDP 47808 reply. The request goes out, the devices answer, and the answers are dropped before YABE sees them. There is no error message &mdash; the log just stays silent."
                        },
                        {
                            type: 'steps',
                            items: [
                                "Open <strong>Windows Defender Firewall with Advanced Security</strong> (or the simpler <em>Allow an app to communicate through Windows Defender Firewall</em> link from the Windows Security notification).",
                                "Tick <strong>Yabe</strong> under <strong>Private networks</strong>. Leave <strong>Public networks</strong> unticked &mdash; a BMS cable is a physically secured private network, and opening 47808 to the public profile is unnecessary exposure.",
                                "Check the <strong>network profile</strong> is right: <strong>Settings &#8250; Network &amp; internet &#8250; Ethernet &#8250; Network profile type</strong> must say <strong>Private</strong>. If Windows picked <em>Public</em> because there is no domain, change it &mdash; otherwise the private tick is ignored.",
                                "For something that has to keep working, add the explicit inbound rule too: <strong>Inbound Rules &#8250; New Rule &#8250; Custom</strong> &rarr; Program = the Yabe executable &rarr; Protocol = <strong>UDP</strong> &rarr; Local port = <strong>47808</strong> &rarr; Remote IP = your BMS subnet &rarr; Profile = All &rarr; Action = <em>Allow the connection</em>.",
                                "The same thing from an administrator PowerShell: <code>netsh advfirewall firewall add rule name=\"YABE BACnet UDP 47808\" dir=in action=allow protocol=UDP localport=47808 remoteip=10.20.30.0/24 profile=any</code>"
                            ]
                        },
                        {
                            type: 'note',
                            title: 'Both directions, one port',
                            text: "BACnet discovery is a UDP broadcast on 47808 and every reply comes back as a unicast to that same port. Filter the outbound or the inbound and you get a network that is demonstrably healthy and a scanner that finds nothing. This is the reason to allow the port rather than merely the executable."
                        }
                    ]
                },

                // ── 7 · install YABE ──────────────────────────────────────
                {
                    type: 'section',
                    title: '7 · Install and open YABE',
                    blocks: [
                        {
                            type: 'figure',
                            src: 'assets/bms-network/06-yabe-add-device.svg',
                            alt: 'YABE with the Functions menu open on Add device, and the network adapter selection listing Ethernet, Wi-Fi and COM ports',
                            caption: 'Functions &#8250; <strong>Add device</strong> &mdash; then pick the Ethernet adapter, not Wi-Fi.'
                        },
                        {
                            type: 'table',
                            columns: ['Step', 'Detail'],
                            rows: [
                                ['Where to get it', 'The project page is <strong>yetanotherbacnetexplorer.sourceforge.io</strong>, hosted on SourceForge. It is free and open source (GPL), written in C#, and runs on Windows without a separate .NET install'],
                                ['Which file', 'The current release is <strong>2.1.0</strong>. On Windows take <code>SetupYabe_v2.1.0.exe</code>; <code>Yabe_v2.1.0.zip</code> is the portable build if you cannot install on the laptop'],
                                ['If it will not start', 'Check whether the build needs the Visual C++ or .NET runtime; the portable zip avoids this entirely'],
                                ['Npcap first', 'Ethernet and Wi-Fi adapters go through a packet capture driver, so <strong>Npcap</strong> (or legacy WinPcap) must be installed on the machine. Without it the adapter list is empty and <em>Add</em> does nothing. Installing Wireshark brings Npcap with it'],
                                ['Which adapter', 'Choose the <strong>Ethernet</strong> entry &mdash; the one that now carries your BMS address. Never the Wi-Fi, never the VPN, never a virtual machine adapter'],
                                ['UDP port', '<strong>47808</strong> (0xBAC0), the BACnet/IP default. Leave it unless the site runs its broadcast table on a different port, which you would be told about explicitly'],
                                ['BBMD field', 'Leave it empty on a single subnet. Only fill it in if the BMS engineer has registered you as a foreign device against a BBMD'],
                                ['Read-only', 'Do not enable any write option. If a dialog offers ReinitializeDevice, DeviceCommunicationControl or Backup/Restore, close it &mdash; those commands disturb a running building']
                            ]
                        },
                        {
                            type: 'note',
                            title: 'One client per machine',
                            text: "BACnet/IP discovery shares UDP port 47808, and YABE is explicit about the consequence: run only one BACnet tool per machine unless it uses an exclusive-socket option. If the site engineer already has a BACnet analyser running on the laptop, close it before starting YABE &mdash; otherwise one of the two will find nothing and it will look like a network fault."
                        }
                    ]
                },

                // ── 8 · scan ──────────────────────────────────────────────
                {
                    type: 'section',
                    title: '8 · Scan and capture the devices',
                    blocks: [
                        {
                            type: 'figure',
                            src: 'assets/bms-network/07-yabe-scan-results.svg',
                            alt: 'YABE device tree with five BACnet devices found, and the Device object properties panel showing vendor id, model, firmware, IP address and UDP port',
                            caption: 'What success looks like &mdash; and the Device object panel on the right is the first deliverable we need.'
                        },
                        {
                            type: 'steps',
                            items: [
                                "With the adapter added, let YABE discover. Devices appear in the tree within a second or two on a normal network; give a large site a minute.",
                                "For every device node, select it and read its <strong>Device object properties</strong>. This is where the identity of the device comes from &mdash; see the table below.",
                                "Expand each device and read <strong>all properties</strong> on every object. Until you do, the tree shows the raw identifier (<code>ANALOG_INPUT:0</code>) instead of the name (<code>Outdoor_DryBulb_Temp</code>); the numeric id is always the real key and stays available in the tooltip.",
                                "Check for <strong>duplicate device instances</strong>. Every BACnet Object Identifier on the network is unique, including the supervisory controller&rsquo;s own. Two nodes reporting the same instance number means a genuine configuration fault &mdash; report it, do not try to work around it.",
                                "Note the scan conditions: date, your name, who authorised it, and the IP you used. That record belongs with the data."
                            ]
                        },
                        {
                            type: 'table',
                            columns: ['Device object property', 'Why we need it', 'Example'],
                            rows: [
                                ['Object Name', 'Matches the name in the vendor export, so we can join the two sheets', 'NAE8500-01'],
                                ['Object Instance', 'Part of the unique BACnet address of the device itself', '12'],
                                ['Vendor ID / Vendor Name', 'The ASHRAE vendor code &mdash; the only way to identify an unnamed device', '17 / Johnson Controls'],
                                ['Model Name', 'Tells us what the device can do and which points should exist on it', 'NAE8500'],
                                ['Firmware Revision', 'Decides which manual and which object set apply', '12.0.8'],
                                ['Application Software Version', 'Differentiates two devices reporting the same firmware', '4.2'],
                                ['Protocol Version Supported', 'Confirms the BACnet revision &mdash; 19 for 135-2020', '19'],
                                ['Protocol Object Types Supported', 'What to expect in the object list; a missing type is a real finding', 'AI AO AV BI BO BV MSI MSO MSV'],
                                ['BACnet IP Address &amp; UDP port', 'How to reach it again outside the site', '10.20.30.40 / 47808']
                            ]
                        }
                    ]
                },

                // ── 9 · MS/TP ─────────────────────────────────────────────
                {
                    type: 'section',
                    title: '9 · If the trunk is BACnet MS/TP (RS-485)',
                    blocks: [
                        {
                            type: 'figure',
                            src: 'assets/bms-network/08-mstp-rs485.svg',
                            alt: 'RS-485 daisy chain from a USB-to-RS485 adapter to four controllers with 120 ohm terminations at both ends, next to the YABE MS/TP port and source address settings',
                            caption: 'MS/TP has no IP addresses &mdash; the laptop talks serial, so sections 2 to 8 do not apply.'
                        },
                        {
                            type: 'note',
                            title: 'No IP, no firewall, no subnet',
                            text: "On MS/TP the laptop&rsquo;s IP address is irrelevant: BACnet/IP does not exist on that bus. What matters is the serial adapter, the COM port and the wiring. The firewall section does not apply either. Sections 10 onwards still do."
                        },
                        {
                            type: 'steps',
                            items: [
                                "Plug in an <strong>isolated USB-to-RS485 adapter</strong>. Check it appears in <strong>Device Manager &#8250; Ports</strong> as a COM port &mdash; if not, the driver is missing, which is the first thing to fix.",
                                "In YABE use <strong>Functions &#8250; Add device</strong>, choose the COM port in the port list and press <strong>Add</strong>. YABE is tested with FTDI adapters; CH340 works too.",
                                "YABE will ask you to define a <strong>source address</strong> when the field is <code>-1</code>. Pick a MAC between 0 and 254 that <em>no real device is using</em>. By default YABE lists the free addresses in the tree and shows unanswered <em>PollForMaster</em> calls, which is how you read the bus and pick a safe number. <strong>Never</strong> reuse a live device address &mdash; that breaks the network for everyone else.",
                                "Leave <strong>MSTP free-address display</strong> on. It is the single most useful diagnostic on a serial bus.",
                                "Turn the <strong>MSTP state machine log</strong> on when a device will not appear. It is verbose, but it tells you whether the frame left the port at all.",
                                "Scan. MS/TP is a polled token bus, so discovery is much slower than IP &mdash; allow a minute per dozen devices."
                            ]
                        },
                        {
                            type: 'note',
                            tone: 'warn',
                            title: 'Wiring rules that decide whether anything works',
                            text: "<strong>120 &#937; termination at the first and last device only</strong> &mdash; anywhere else distorts the signal. <strong>Bias / fail-safe resistors at one end only.</strong> <strong>A and B reversed means nothing scans</strong> and it is the first thing to try: swap the pair at the adapter, it costs nothing. Connect the <strong>shield to one end only</strong> (the panel end) or you create a ground loop. And <em>never</em> cut or unplug a live trunk to gain access &mdash; tie in at an existing spare connector on a panel, with the site engineer present."
                        }
                    ]
                },

                // ── 10 · export ───────────────────────────────────────────
                {
                    type: 'section',
                    title: '10 · Get the point list out',
                    blocks: [
                        {
                            type: 'figure',
                            src: 'assets/bms-network/09-yabe-object-export.svg',
                            alt: 'The YABE object list as a table, and a table mapping each column to either the YABE scan or the vendor point export',
                            caption: 'A YABE object list on its own is not a point list &mdash; some columns only exist in the vendor export.'
                        },
                        {
                            type: 'table',
                            columns: ['Column', 'From the YABE scan', 'From the vendor point export'],
                            rows: [
                                ['Object type + instance', 'Yes &mdash; the unique key', 'Usually absent; add it from this scan'],
                                ['Present value (liveness)', 'Yes &mdash; proves the point answers now', 'Sometimes'],
                                ['Engineering units', 'Often present', 'Usually cleaner and more authoritative'],
                                ['Description', 'Sometimes &mdash; vendor-specific', 'Usually present'],
                                ['Location / building hierarchy', '<strong>No</strong>', '<strong>Required</strong> &mdash; this is why the export is still needed'],
                                ['Read / write access', 'Property exists; your policy decides', 'Required'],
                                ['Out-of-service &amp; alarm flags', 'Yes &mdash; find points that exist but lie', 'Usually present too'],
                                ['Historisation configured?', 'No &mdash; a workstation setting', 'Recommended']
                            ]
                        },
                        {
                            type: 'note',
                            title: 'Export mechanics differ between YABE versions',
                            text: "The current release keeps a session file under <strong>File &#8250; Save As</strong> and can log subscribed values and events to CSV by right-clicking the monitor panel; older builds and the community plugins copy the object list straight out of the tree to the clipboard. Whatever your build offers, the <em>outcome</em> must be one CSV with the device, object type, instance, name, present value, units and out-of-service flag on every row. If your version offers no export at all, select the device, expand it, copy, and paste into a spreadsheet &mdash; then tidy the columns."
                        },
                        {
                            type: 'checklist',
                            items: [
                                "One row per device with the nine Device object properties from section 8",
                                "One row per object with device, type, instance, name, value, units, out-of-service",
                                "The object instance for every point &mdash; a trend file without it cannot be tied back to equipment",
                                "A note of which adapter, port and address you used, and the date",
                                "Your own tag for each point, if the site already has one"
                            ]
                        }
                    ]
                },

                // ── 11 · troubleshooting ──────────────────────────────────
                {
                    type: 'section',
                    title: '11 · Troubleshooting',
                    blocks: [
                        {
                            type: 'table',
                            columns: ['Symptom', 'Most likely cause', 'What to do'],
                            rows: [
                                ['<code>ipconfig</code> still shows <code>169.254.x.x</code>', 'The static address did not commit, or the adapter is set to Automatic again', 'Re-apply the manual address and replug the cable. If a DHCP server exists on the BMS segment it will keep overwriting you &mdash; the site must reserve or exclude your address'],
                                ['Laptop has the right IP, YABE finds nothing', 'Default gateway filled in, or Wi-Fi / VPN / a VM adapter is winning the route', 'Empty the gateway field. Switch off Wi-Fi, disconnect the VPN, disable unused and virtual adapters, then rescan'],
                                ['Only <em>some</em> devices appear', 'Wrong subnet mask, or you are on a different VLAN', 'Copy the mask exactly from the BMS workstation. Check with the switch port config whether the BMS devices are VLAN-tagged'],
                                ['Ping fails but the scan is also empty', 'Wrong subnet, cable, or dead switch port &mdash; ICMP failure alone proves nothing', 'Run <code>arp -a</code>. No rows for the devices means layer 2 is the problem: cable, port, or the wrong VLAN'],
                                ['Ping works, YABE still finds nothing', 'Windows Defender Firewall is dropping the UDP 47808 replies', 'Section 6. This is the single most common cause on a correctly addressed laptop'],
                                ['Nothing at all, on a network you know is alive', 'Crossing a router, or a VLAN filter that blocks broadcasts', 'Discovery cannot cross a router by itself. A BBMD with a foreign-device registration is required &mdash; that is an engineer task'],
                                ['Devices appear then disappear during a long scan', 'The network is busy, or segmentation is failing on large reads', 'In YABE Options set <strong>Segments_Max</strong> to <code>0</code> to disable segmentation, then rescan'],
                                ['Device shows but its object list is empty', 'Properties were never read &mdash; the tree only knows the Device object', 'Select the device and use the read-all / read-properties function on every object, then expand'],
                                ['Two nodes report the same device instance', 'A genuine BACnet fault: duplicate Object Identifiers on one network', 'Report it to the BMS engineer. Do not rename anything to make it go away'],
                                ['Object names show as <code>ANALOG_INPUT:0</code>', 'Properties not read yet, or the device has no PROP_NAME', 'Read the properties. If there is still no name, the numeric id <em>is</em> the identifier &mdash; use it and ask the site for the tag'],
                                ['Every device is <code>COMM_UNREACHABLE</code> or errors on read', 'A device in alarm, or its network stack is down', 'Check the controller&rsquo;s own status LED and the BMS alarm list. A device that cannot talk cannot be scanned'],
                                ['YABE adapter list is empty', 'Npcap / WinPcap not installed', 'Install Npcap (Wireshark bundles it), restart YABE'],
                                ['YABE cannot be added to, or nothing binds', 'Another BACnet tool is already holding UDP 47808 on that machine', 'Close the other analyser. YABE notes that only one client per machine works reliably without the exclusive-socket option'],
                                ['MS/TP: no devices, no errors', 'A and B reversed, or no common ground between adapter and bus', 'Swap A and B at the adapter first. Verify the SHD / reference connection'],
                                ['MS/TP: random devices or timeouts', 'Missing or duplicated 120 &#937; terminations, or bias resistors at the wrong end', 'Termination at the first and last device only; bias at one end only. On a long trunk this is the usual cause'],
                                ['MS/TP: a device will not appear at all', 'MSTP address collision, or the speed does not match', 'Check for a duplicate MAC on the bus. Turn on the MSTP state machine log and read the bus traffic'],
                                ['Everything worked yesterday, nothing today', 'The laptop address was left static, or a Windows update reset the firewall', 'Re-check <code>ipconfig</code> and the firewall rules; re-run the scan after a reboot']
                            ]
                        },
                        {
                            type: 'note',
                            title: 'Escalate rather than troubleshoot these',
                            text: "Anything to do with <strong>writing to the building</strong>, <strong>rebooting a controller</strong>, <strong>changing a subnet or VLAN</strong>, <strong>editing the BBMD table</strong>, or <strong>duplicate device instances</strong> &mdash; stop and hand it to the BMS contractor. Those are engineering tasks with plant consequences, and the scan you have is already worth more to them than an afternoon of guesswork."
                        }
                    ]
                },

                // ── 12 · restore ──────────────────────────────────────────
                {
                    type: 'section',
                    title: '12 · Put the laptop back the way you found it',
                    blocks: [
                        {
                            type: 'steps',
                            items: [
                                "Set the Ethernet adapter back to <strong>Automatic (DHCP)</strong> in the same place you changed it.",
                                "Re-enable Wi-Fi and reconnect the VPN, and re-enable any adapter you disabled in section 2.",
                                "Unplug the cable &mdash; and only the cable you plugged in.",
                                "If you added a firewall rule, leave it; it is harmless and the next person will need it. Mention it in your handover note.",
                                "Send the two deliverables from section 10, plus a one-line note of the conditions the scan ran under."
                            ]
                        },
                        {
                            type: 'note',
                            title: 'Why this matters',
                            text: "A laptop left on a static BMS address looks like a rogue machine to the site&rsquo;s network team, and its missing gateway silently breaks email, printing and VPN for whoever picks it up next. Ten seconds of tidying prevents a ticket."
                        }
                    ]
                },

                {
                    type: 'refs',
                    items: [
                        { label: 'YABE — project page and documentation (Yet Another BACnet Explorer, GPL)', url: 'https://yetanotherbacnetexplorer.sourceforge.io/' },
                        { label: 'YABE — releases and downloads, including SetupYabe_v2.1.0.exe', url: 'https://sourceforge.net/projects/yetanotherbacnetexplorer/files/' },
                        { label: 'BACnet Committee — developer aids, including the YABE entry and protocol references', url: 'https://bacnet.org/developer-aids/' },
                        { label: 'Microsoft — best practices for configuring Windows Firewall', url: 'https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/best-practices-configuring' },
                        { label: 'Microsoft — Windows Firewall overview, including the built-in UDP rule groups', url: 'https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/' },
                        { label: 'Wireshark / Npcap — the packet capture driver YABE needs for Ethernet and Wi-Fi adapters', url: 'https://www.wireshark.org/' }
                    ]
                }
            ]
        },

        honeywell: {
            title: "Honeywell EBI — Point List &amp; Trend Export",
            wide: true,
            footer: "Send the device sheet + point list to data@retragreen.com · Questions: support@retragreen.com",
            blocks: [
                {
                    type: 'lead',
                    text: "Written for the site BMS engineer. Honeywell splits this across two products, and the difference decides your route: on a <strong>local EBI R600 workstation</strong> the point list comes from the All Points Report and Excel data exchange; on the <strong>EBI 2025 / EBI One cloud portal</strong> (Supervisor Portal) you get a real <code>.CSV</code> export directly."
                },
                {
                    type: 'note',
                    title: 'Which EBI do you have?',
                    text: "There is no public <em>EBI operator manual</em> — the step names below come from Honeywell&rsquo;s official EBI R600 Guide Specification and the Supervisor Portal User Guide. If your screens do not match, send us a picture of your menu rather than guessing. Note also that <strong>EBI 700 / 800</strong> are not current product names — the current releases are EBI 2025 and EBI One."
                },
                {
                    type: 'note',
                    title: 'Two different exports — send the right one',
                    text: "<strong>Point list / point structure</strong> = which points exist, their type, unit and description. <strong>Trend data</strong> = the values over time. A trend file cannot replace the point list — it has no object identifiers, so the series cannot be tied back to equipment."
                },
                {
                    type: 'section',
                    title: '1 · What we need you to send',
                    blocks: [
                        {
                            type: 'table',
                            columns: ['Deliverable', 'Content', 'Why we need it'],
                            rows: [
                                ['<strong>A · Device &amp; network sheet</strong>', 'One row per BACnet device — identity and addressing (1.1)', 'Tells us who to talk to, and whether the points are reachable from outside the BMS'],
                                ['<strong>B · Point list / point mapping</strong>', 'One row per point — name, type, address, unit, read/write, purpose (1.2)', 'The mapping our data platform uses to name, unit and validate every series']
                            ]
                        },
                        {
                            type: 'section',
                            title: '1.1 · Device &amp; network sheet — one row per device',
                            blocks: [
                                {
                                    type: 'table',
                                    columns: ['Field', 'Where it comes from in EBI', 'Example'],
                                    rows: [
                                        ['Site name', 'EBI site / building record', 'HQ — Tower A'],
                                        ['Vendor ID and vendor name', 'EBI&rsquo;s own BACnet identity is fixed in the R600 PICS: Vendor ID <strong>17</strong> / Honeywell International, Inc.', '17 / Honeywell International'],
                                        ['Product model', 'EBI R600 BACnet PICS &rarr; Product Model Number', 'R600'],
                                        ['Firmware revision', 'EBI R600 BACnet PICS &rarr; Firmware Revision', 'R600.1'],
                                        ['Application software version', 'EBI R600 BACnet PICS &rarr; Application Software Version', '1015.202.x'],
                                        ['BACnet protocol revision', 'EBI R600 BACnet PICS &rarr; BACnet Protocol Revision', '1.15'],
                                        ['BACnet device profile', 'EBI R600 PICS — B-OWS and BACnet Advanced Operator Workstation (B-AWS)', 'B-AWS'],
                                        ['Per-device IP, serial, baud, parity', 'Database Configuration Tool &rarr; communications parameters for that device', '10.20.30.40 / 9600 / none / 8-1-1'],
                                        ['Device instance, network number, UDP port, per-site BBMD', '<em>Not shown in the EBI operator interface</em>', 'Take these from the controllers themselves or from BACnet discovery tooling — do not guess them'],
                                        ['Number of points in scope', 'Row count of the point export (section 2)', '1,876']
                                    ]
                                },
                                {
                                    type: 'note',
                                    text: "EBI is itself a BACnet Advanced Operator Workstation: the R600 PICS lists the object types it can view and modify (Analog / Binary / Multistate Input, Output and Value, Device, Schedule, Trend Log and more). A point discovered on the EBI BACnet AWS is therefore exposed. A useful cross-check: the PICS states that <em>&ldquo;this product cannot be used to modify BACnet objects on sites requiring UL Classification&rdquo;</em> — if we ever need write-back on a UL-classified site, that has to be agreed in advance."
                                }
                            ]
                        },
                        {
                            type: 'section',
                            title: '1.2 · Point list columns — one row per point',
                            blocks: [
                                {
                                    type: 'table',
                                    columns: ['Column', 'Meaning', 'Where it comes from in EBI', 'Priority'],
                                    rows: [
                                        ['Tag (our name)', 'The name we will use in the data platform', 'You assign it', 'Required'],
                                        ['Point name', 'Point name in the EBI database', 'All Points Report &rarr; point name', 'Required'],
                                        ['Description', 'What the point measures or controls', 'All Points Report &rarr; description', 'Required'],
                                        ['Point type', 'Analogue, binary, multistate…', 'All Points Report &rarr; point type', 'Required'],
                                        ['Engineering units', 'Engineering units of the point', 'All Points Report &rarr; engineering units', 'Required'],
                                        ['Current value', 'Liveness check at the time of the report', 'All Points Report &rarr; current value', 'Required'],
                                        ['Location hierarchy', 'Where the point sits in the building hierarchy', 'Point record / report grouping', 'Required'],
                                        ['BACnet object type and instance', 'How the point is addressed over BACnet', '<em>Not in the EBI point export</em> — from BACnet discovery tooling', 'Required for BACnet'],
                                        ['Read / Write', 'Whether we may only read, or are also allowed to command', 'Point properties / your policy', 'Required'],
                                        ['Out-of-service / alarm-suppressed / manual flags', 'Points that exist but cannot be trusted as-is', 'Point Attribute Report (section 5)', 'Recommended'],
                                        ['Free-format fields', 'Cabinet and wire numbers, engineering notes', 'Database Configuration Tool free-format fields', 'Recommended'],
                                        ['Historization configured?', 'Whether the point has history collection at all', 'Point definition &rarr; historical collection is per-point and opt-in', 'Recommended']
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '2 · Method A — Local EBI R600: the point list',
                    blocks: [
                        {
                            type: 'note',
                            text: "There is no single &ldquo;export point list&rdquo; button in the EBI operator interface. Honeywell&rsquo;s spec describes two official routes below — run the All Points Report, then use the Database Configuration Tool for the Excel version. You need roughly <strong>security Level 4</strong> or above."
                        },
                        {
                            type: 'steps',
                            items: [
                                "Sign on at the required privilege level. On EBI R600 that is <strong>Level 4 or higher</strong> — Level 4 is what adds report building and access to the standard configuration displays.",
                                "Run the pre-configured <strong>All Points Report</strong> from the report facility. Per the R600 specification it produces a list of point information including point name, description, point type, engineering units and current values.",
                                "Set the filters — point name or wildcard, filter information, and the time interval for the search — plus the destination.",
                                "Choose the destination: printer, operator interface, or internal file. The report output formats are <strong>HTML, Microsoft Word or RTF</strong> — <em>not</em> CSV on this route.",
                                "If you need a real spreadsheet, launch the <strong>Database Configuration Tool</strong> from the operator workstation. The specification confirms it can <strong>export information to and import information from Microsoft Excel</strong> — this is the only officially confirmed Excel point-record export on R600.",
                                "In the Database Configuration Tool, select the points or object groups you need and use the bulk copy/paste to Excel, together with its database management reports."
                            ]
                        },
                        {
                            type: 'note',
                            title: 'What the point export does not contain',
                            text: "The report column set has no BACnet object type or instance, device instance, vendor ID, network number or UDP port, and no flag for &ldquo;is this point BACnet exposed&rdquo;. Those come from section 1.1. EBI also supports bulk Excel data exchange at system level, including periodic or snapshot retrieval and retrieval of tag names and descriptions — useful if your site already has an Excel-based exchange running."
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '3 · Method B — EBI 2025 / EBI One cloud portal: point list and CSV',
                    blocks: [
                        {
                            type: 'note',
                            text: "The cloud portal (Supervisor Portal / Remote Building Manager, hosted on the Honeywell Forge Cloud Platform) is a <strong>different product</strong> from the local workstation and needs its own site subscription. It is the one place where a genuine <code>.CSV</code> trend export is officially documented."
                        },
                        {
                            type: 'steps',
                            items: [
                                "Open the site and go to the Equipment / Device Detail Dashboard. Use the <strong>Point View / Point List</strong> for the point list.",
                                "For history: open the <strong>Trends</strong> tab, pick the date, and switch between <strong>Daily / Hourly / Minute</strong> views. Select the points through trend settings — up to 10 points per trend (max 6 analogue, 4 digital, 4 Y-axes), so export in batches for larger scopes.",
                                "Click the <strong>export icon</strong>. The Supervisor Portal user guide states the trend data can be exported to <strong>.CSV</strong> format.",
                                "For scheduled delivery use <strong>Reports</strong>: Reports icon &rarr; <strong>CREATE NEW REPORT</strong> &rarr; Report Name &rarr; Site(s) &rarr; Report Type &rarr; <strong>SAVE AND CONTINUE</strong> &rarr; choose the date range &rarr; choose the format (<strong>PDF, CSV or XLSX</strong>) &rarr; set Data Customization &rarr; <strong>SAVE AND CONTINUE</strong>.",
                                "Set the delivery schedule to send to registered email addresses, at portfolio or site scope."
                            ]
                        },
                        {
                            type: 'note',
                            title: 'Gateway topology shapes what you will see',
                            text: "Plant controllers, unitary controllers, hubs and meters connect to the gateway over <strong>BACnet and Modbus</strong>, so the cloud point list is a subset of the EBI database. Two consequences: an unmodelled controller or unassigned point makes its alarms default to the gateway and land under the wrong site; and the current release does <strong>not</strong> support Active Alarms and over-ridden points in the Points tab view for the Honeywell Forge Gateway. Check the <strong>TOTAL / OFFLINE / ACTIVE HIGH ALARM</strong> counters and the gateway Online/Offline status before trusting an export."
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '4 · Historical trend data on the local R600',
                    blocks: [
                        {
                            type: 'bullets',
                            items: [
                                "History collection is <strong>per-point and opt-in</strong> — a point can exist with no historization configured, and therefore have no trend data at all.",
                                "The specification provides snapshots and averages at <strong>intervals from 1 second to 24 hours</strong>.",
                                "Collection can be edited <strong>on-line without loss</strong> of previously collected data; historization is not interrupted by configuration changes.",
                                "The history engine supports <strong>three separately managed collections of up to 100,000 point values each</strong> and archives to local or remote disk, preserving data <strong>more than 10 years</strong> given appropriate storage.",
                                "Trending allows up to <strong>32 points per trend window</strong>, with up to 1,000 pre-built trend displays (optionally extended to 30,000).",
                                "For a spreadsheet on the R600, the specification explicitly supports <strong>copying the currently displayed trend data to the clipboard</strong> for pasting into a spreadsheet or document. Reports themselves output HTML, Word or RTF."
                            ]
                        },
                        {
                            type: 'note',
                            text: "Honeywell does not publish a maximum export file size, row limit, or per-report retention window for EBI. If we need a very long history, agree the extraction approach with your Honeywell integrator first."
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '5 · Checks before you send it',
                    blocks: [
                        {
                            type: 'checklist',
                            items: [
                                "You are signed on at <strong>security Level 4 or higher</strong> — below that you cannot build reports.",
                                "Run the <strong>Point Attribute Report</strong> as well: it filters on out-of-service, alarm-suppressed, abnormal input levels and points in manual mode. That report is the fastest way to find the points we cannot trust.",
                                "BACnet object type and instance obtained separately — the EBI point export does not carry them.",
                                "Device instance, network number, UDP port and BBMD status taken from the controllers or from BACnet discovery tooling, not guessed.",
                                "Every point has a description and a unit, and the historization status is stated per point.",
                                "Cloud export: the gateway is online and the OFFLINE counter is zero, and unmodelled controllers have been assigned to the correct site.",
                                "Write-back is not assumed. If we need it, the UL Classification restriction in the EBI PICS has been cleared with the site first."
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
                                ['No report option available', 'Signed on below security Level 4', 'Sign on at Level 4 or above; Level 3 only adds point control'],
                                ['The point export is not a CSV', 'All Points Report outputs HTML, Word or RTF only', 'Use the Database Configuration Tool for the Excel export, or the cloud portal for a real .CSV'],
                                ['A point has no trend data', 'Historization is opt-in and was never configured for that point', 'Confirm the point definition includes historical collection before requesting history'],
                                ['Points appear under the gateway instead of the site', 'Controller or points unmodelled / unassigned to a site', 'Assign the controller to its site; unmodelled alarms otherwise default to the gateway'],
                                ['Over-ridden points or active alarms missing in the Points tab', 'Not supported in the current release for the Honeywell Forge Gateway', 'Use the R600 local system or an alarm report rather than the Points tab view'],
                                ['Device instance, network number or UDP port not in EBI', 'Not exposed in the EBI operator interface', 'Read them from the controllers or from BACnet discovery tooling'],
                                ['Database Configuration Tool will not open the data', 'Insufficient security access for the database configuration tool', 'Sign on with a user holding sufficient security access'],
                                ['Trend window only shows part of the scope', '32 points per trend window on the R600', 'Split into several trend windows or use the database management reports'],
                                ['Long history requested but data is missing', 'No documented export size limit, but storage and archiving are site-specific', 'Agree the extraction approach with your Honeywell integrator before promising a range']
                            ]
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '7 · Official Honeywell references',
                    blocks: [
                        {
                            type: 'refs',
                            items: [
                                { label: 'EBI R600 Guide Specification v3 (April 2020) — reporting, All Points Report, history management, trending, database configuration tool, security levels', url: 'https://buildings.honeywell.com/content/dam/hbtbt/en/documents/downloads/IS_Guide%20Spec_EBI%20R600_04.20%20V2.pdf' },
                                { label: 'Honeywell Forge for Buildings Supervisor Portal (EBI) User Guide, 31-00864-5 Rev 5 (21-Nov-2025) — point list, trend .CSV export, reports, device status', url: 'https://prod-edam.honeywell.com/content/dam/honeywell-edam/hbt/en-us/documents/manuals-and-guides/user-manuals/hon-ba-hbs-honeywell-forge-for-buildings-supervisor-portal-user-guide-ebi-31-00864-5.pdf' },
                                { label: 'Honeywell EBI BACnet PICS (March 2020) — Vendor ID 17, model, firmware, protocol revision, B-OWS / B-AWS profiles, object types, networking options', url: 'https://www.bacnetinternational.net/catalog/manu/honeywell%20international/EBI_PICS_R600.pdf' },
                                { label: 'EBI-600 / EBI 2025 product page', url: 'https://buildings.honeywell.com/us/en/solutions/optimization/ebi-600' },
                                { label: 'EBI 2025 brochure — Windows 11 / Server 2022 / SQL Server 2022 platform, OPC UA point server', url: 'https://buildings.honeywell.com/content/dam/hbtbt/en/documents/downloads/hon-ba-hbs-integrated-operations-ebi-2025-brochure.pdf' },
                                { label: 'EBI 2025 Open Systems Technical Resource Guide — supported open protocols (BACnet, Modbus, LonWorks, OPC, ONVIF)', url: 'https://buildings.honeywell.com/content/dam/hbtbt/en/documents/downloads/hon-ba-ebi-2025-open-systems-white-paper.pdf' },
                                { label: 'EBI One &ndash; Powered by Forge Cognition', url: 'https://buildings.honeywell.com/us/en/solutions/integrated-operations/ebi-one-powered-by-forge-cognition' },
                                { label: 'EBI One overview brochure', url: 'https://buildings.honeywell.com/content/dam/hbtbt/en/documents/downloads/hon-ba-ebi-one-overview-brochure.pdf' },
                                { label: 'EBI modernisation guide — EBI One vs existing EBI environments', url: 'https://buildings.honeywell.com/content/dam/hbtbt/en/documents/downloads/hon-ba-enterprise-buildings-integrator-cognition-modernization-guide.pdf' }
                            ]
                        }
                    ]
                }
            ]
        },
        siemens: {
            title: "Siemens Desigo CC — Point List &amp; Trend Export",
            wide: true,
            footer: "Send the device sheet + point list to data@retragreen.com · Questions: support@retragreen.com",
            blocks: [
                {
                    type: 'lead',
                    text: "Written for the site BMS engineer. In Desigo CC both deliverables come out of the same reporting tool as an Excel workbook: the <strong>Objects report</strong> is the point list, the <strong>Trends report</strong> is the history. Steps below are verified against the current Desigo CC V9 online help."
                },
                {
                    type: 'note',
                    title: 'Screen names differ on older systems',
                    text: "Verified against <strong>Desigo CC V9</strong>. On much older Desigo Insight V4.x or Desigo CC 6.x/7.x installations the same functions carry different names. If your system does not look like the screenshots, send us a picture of your menu and we will map it — do not guess the path."
                },
                {
                    type: 'note',
                    title: 'Two different exports — send the right one',
                    text: "<strong>Objects report</strong> = which points exist, their type, unit and description. <strong>Trends report</strong> = the values over time. A trend workbook cannot replace the point list: it has no object identifiers, so the series cannot be tied back to equipment."
                },
                {
                    type: 'section',
                    title: '1 · What we need you to send',
                    blocks: [
                        {
                            type: 'table',
                            columns: ['Deliverable', 'Content', 'Why we need it'],
                            rows: [
                                ['<strong>A · Device &amp; network sheet</strong>', 'One row per BACnet device — identity and addressing (1.1)', 'Tells us who to talk to, and whether the points are reachable from outside the BMS'],
                                ['<strong>B · Point list / point mapping</strong>', 'One row per point — name, type, instance, unit, read/write, purpose (1.2)', 'The mapping our data platform uses to name, unit and validate every series']
                            ]
                        },
                        {
                            type: 'section',
                            title: '1.1 · Device &amp; network sheet — one row per device',
                            blocks: [
                                {
                                    type: 'table',
                                    columns: ['Field', 'Where to read it in Desigo CC', 'Example'],
                                    rows: [
                                        ['Site name', 'System Browser &gt; Site object name', 'HQ — Tower A'],
                                        ['Management-station BACnet device instance', 'BACnet tab &gt; Settings expander &gt; Instance Number (factory default 9998)', '9998'],
                                        ['Vendor IDs', 'Same Settings expander (defaults 0 and 600, add your own with Add)', '0, 600'],
                                        ['Max APDU length', 'Same Settings expander (default 1476 bytes)', '1476'],
                                        ['BACnet/IP address &amp; UDP port', 'BACnet tab &gt; BT BACnet Stack Config &gt; Gateway Port Table &gt; Port Properties', '10.20.30.40 / 47808'],
                                        ['Network number', 'Same Port Properties', '1'],
                                        ['BBMD or Foreign Device', 'Same expander — configure the physical port as BBMD or Foreign Device', 'BBMD'],
                                        ['Field device instance / name / MAC', 'Device Info expander on the scanned device', 'Device, 12 / AHU-1 / 00:1B:19:…'],
                                        ['Point-level BACnet identity', 'BACnet Object Browser &gt; Edit Object Property Reference: Device Instance, Object Type, Object Instance, Property ID', '12 / AI / 1201 / 85'],
                                        ['Number of matched objects', 'Row count of the Objects report (section 2)', '2,140']
                                    ]
                                },
                                {
                                    type: 'note',
                                    title: 'These fields need Engineering mode',
                                    text: "The BACnet driver settings, the Device Info expander and the BACnet Object Browser are engineering-side functions: they need <strong>Engineering mode</strong> and the <strong>BACnet EDE extension module</strong> installed. Ask the engineer who maintains the system, not a day-to-day operator."
                                }
                            ]
                        },
                        {
                            type: 'section',
                            title: '1.2 · Point list columns — one row per point',
                            blocks: [
                                {
                                    type: 'table',
                                    columns: ['Column', 'Meaning', 'Where it comes from in Desigo CC', 'Priority'],
                                    rows: [
                                        ['Tag (our name)', 'The name we will use in the data platform', 'You assign it', 'Required'],
                                        ['Object name', 'Name of the point in the system', 'Objects report &rarr; Name', 'Required'],
                                        ['Object type', 'AI / AO / BI / BO / AV / MSV…', 'Objects report &rarr; Type', 'Required'],
                                        ['Object instance', 'Instance part of the BACnet Object Identifier', 'BACnet Object Browser &rarr; Object Instance (engineering side)', 'Required for BACnet'],
                                        ['Object reference', 'Desigo CC reference of the object', 'Objects report &rarr; reference column', 'Required'],
                                        ['Property', 'Which property the value is taken from (Present Value, Status…)', 'Objects report property columns', 'Required'],
                                        ['Unit', 'Engineering units (°C, kW, m³/h, %RH)', 'Objects report &rarr; Unit', 'Required'],
                                        ['Read / Write', 'Whether we may only read, or are also allowed to command', 'Point properties / your policy', 'Required'],
                                        ['Present value &amp; quality', 'Sanity check that the point is alive and trustworthy', 'Objects report &rarr; Value, Quality', 'Recommended'],
                                        ['Discipline / Subdiscipline / Description', 'Grouping and the purpose of the point', 'Activities report columns', 'Recommended'],
                                        ['Trend log?', 'Whether the point is trended, and the interval', 'Trend View Definition / Trends report', 'Recommended'],
                                        ['Resolution, Min / Max', 'Engineering range of the point', 'Objects report property columns', 'Optional']
                                    ]
                                },
                                {
                                    type: 'note',
                                    title: 'What the Objects report does not contain',
                                    text: "No report column set carries the BACnet vendor ID, model, firmware, IP/UDP port, device instance, network number or MAC. Those exist only in the BACnet driver configuration under Engineering mode — capture them separately using section 1.1."
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '2 · Method A — Objects report (the point list)',
                    blocks: [
                        {
                            type: 'steps',
                            items: [
                                "Start <strong>System Manager</strong>. Running the report needs only the Show right; any BACnet work additionally needs <strong>Engineering mode</strong> (section 4).",
                                "Open <strong>System Browser &gt; Reports</strong> and create a new Report Definition.",
                                "On the <strong>Home</strong> tab, in the <strong>Insert</strong> group choose <strong>Table</strong> and select the <strong>Objects</strong> table — or right-click the definition and use <strong>Insert Table</strong>.",
                                "Drag the source object from the System Browser into the definition, or set the table's <strong>Name filter</strong>. Wildcards work, e.g. <code>*CHW*</code>.",
                                "Right-click the table &rarr; <strong>Select Columns</strong> and tick what you need. For an Objects table you must first pick the object type in the <strong>Type</strong> drop-down, and property columns only appear when their display levels are enabled under <strong>Models and Functions tab &gt; Properties</strong> expander.",
                                "Click <strong>Run</strong>, then <strong>Create and view Excel</strong>. MS Excel 2007 or later must be installed on that PC, otherwise the button stays disabled. The workbook is staged in a local temp folder and you are then prompted to save a permanent copy.",
                                "Repeat per system (water / air / electrical) and per site. Save as <code>SiteName_PointList_YYYYMMDD.xlsx</code>."
                            ]
                        },
                        {
                            type: 'note',
                            title: 'Refreshing it automatically',
                            text: "<strong>Settings</strong> tab &rarr; <strong>Report Output</strong> &rarr; Dialog Launcher &rarr; <strong>Report Output Definition</strong>: set Destination types = <strong>File</strong>, Report format = <strong>Excel</strong>, and choose a destination path. <strong>Create and view PDF</strong> is the print alternative; PDFs longer than 500 pages are split into two documents."
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '3 · Method B — Trends report (historical data)',
                    blocks: [
                        {
                            type: 'steps',
                            items: [
                                "In the same Reports area insert a <strong>Trends</strong> table, or drag a <strong>Trend View Definition</strong> onto the definition — that sets the Name filter for you.",
                                "Choose the time range: absolute dates, relative to the current date, to a start/stop date, a predefined range, or the time-range scrollbar.",
                                "For a fixed cadence use the interval-based Trends Report: it adds a <strong>Time Filter</strong> (range plus interval) and an optional <strong>Condition Filter</strong> on Value or Quality. The shipped template <code>HQ_TrendLog_15Min</code> is a good starting point.",
                                "Click <strong>Run</strong> &rarr; <strong>Create and view excel</strong>, then save the workbook.",
                                "Check the layout: one common <strong>Date Time</strong> column plus one column per series, each headed by the trended object (or custom text) with its unit and alias."
                            ]
                        },
                        {
                            type: 'note',
                            title: 'Before you call a gap a data gap',
                            tone: 'warn',
                            text: "The Trends table reports per-point quality attributes — read them before assuming the logger is at fault: <strong>TrendLogEnabled (41)</strong> logging is switched off, <strong>TrendError (42)</strong> logging fault, <strong>TrendRollover (44)</strong> buffer wrapped, <strong>TrendLogInterrupted (46)</strong> the controller dropped the log, <strong>TrendPurge (43)</strong> history purged. TrendTimeShift (40), TrendStartLogging (48) and TrendValueReduced (49) also change what you see."
                        },
                        {
                            type: 'note',
                            text: "Siemens does not publish a trend export size limit or a retention period for Desigo CC — get both confirmed in writing from your Siemens support contact for your licence."
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '4 · Access and licence prerequisites',
                    blocks: [
                        {
                            type: 'table',
                            columns: ['Requirement', 'What it means for the export'],
                            rows: [
                                ['Application right <strong>Show</strong>', 'Minimum to run a report and read the result'],
                                ['Application right <strong>Configure</strong>', 'Needed to create and save a report definition — without it Save / New / Delete / Edit are unavailable'],
                                ['Application right <strong>Export</strong>', 'Granted separately from Show and Configure; without it the workbook cannot be produced'],
                                ['<strong>Engineering mode</strong>', 'Hard prerequisite for all BACnet driver and BACnet Object Browser work'],
                                ['<strong>BACnet EDE extension module</strong>', 'Must be installed before third-party BACnet devices can be integrated at all'],
                                ['Excel 2007 or later', 'Installed locally on the workstation running the report'],
                                ['Valid licence', 'Without one the server runs 30 minutes, then stops the project and forces a log-off; in Demo mode you cannot leave Engineering mode']
                            ]
                        },
                        {
                            type: 'note',
                            text: "Application rights intersect with <strong>Scope</strong> rights: a user can hold Export and still not see the objects that matter to us. Check both when an export comes back suspiciously short."
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '5 · Checks before you send it',
                    blocks: [
                        {
                            type: 'checklist',
                            items: [
                                "The person exporting holds the <strong>Export</strong> application right, not just Show.",
                                "Objects report: the Type drop-down was set <em>before</em> Select Columns — otherwise you silently get an empty or property-less table.",
                                "Activities report: the <strong>AL</strong> attribute is selected on the object, or its property rows are silently omitted.",
                                "Every point has a unit and a description. Desigo CC does not invent them, and a wrong unit silently ruins the analysis.",
                                "BACnet object instance numbers captured from the BACnet Object Browser — the Objects report does not carry them.",
                                "Network number identical on the management platform, the virtual port and the virtual BACnet network. A mismatch stops the stack configuration from saving.",
                                "Field device instance numbers are populated — they stay blank until the configuration file is imported and a connection is established.",
                                "BACnet drivers were saved with the physical network connected, otherwise the configuration imports but the driver never talks to the field.",
                                "For every trended point the <strong>TrendLogEnabled</strong> quality bit is on."
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
                                ['“Create and view Excel” is greyed out', 'Excel 2007 or later not installed on that workstation', 'Run the export from a PC with Excel installed'],
                                ['Objects report has no property columns', 'Object type not chosen in the Type drop-down, or display levels not enabled', 'Set the type first, then enable the display levels under Models and Functions &gt; Properties'],
                                ['Activities report is missing properties', 'The AL attribute is not selected on the object', 'Select AL on the object, then re-run the report'],
                                ['Device instance stays blank', 'The configuration file has not been imported yet', 'Import the configuration; the remaining Device Info fields populate once a connection is established'],
                                ['BACnet stack configuration will not save', 'Network number mismatch between platform, virtual port and virtual BACnet network', 'Make the three network numbers identical'],
                                ['Some trend columns are empty', 'TrendLogEnabled, TrendError, TrendRollover, TrendLogInterrupted or TrendPurge is set', 'Read the Trends quality attributes for those points and fix logging on the controller'],
                                ['The session ends mid-export', 'No valid licence — the 30-minute Demo mode cutoff', 'Export from a licensed server session'],
                                ['A point is visible in Desigo CC but not to a third party', 'Engineering mode not enabled, BACnet EDE module missing, or the driver has no physical connection', 'Check all three — the driver needs a live network connection to publish anything'],
                                ['The licence data point count suddenly jumps', 'An EDE import counts every imported room-device data point as a licence data point', 'Import only the points you actually need']
                            ]
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '7 · Official Siemens references',
                    blocks: [
                        {
                            type: 'refs',
                            items: [
                                { label: 'Version Information — Desigo CC V9 and extension modules (30240157835)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/30240157835.html' },
                                { label: 'Insert Tables — Objects / Trends / Activities, Select Columns (23964905867)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/23964905867.html' },
                                { label: 'View a Report — Excel 2007+ prerequisite, temp staging, 500-page PDF split (23907511307)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/23907511307.html' },
                                { label: 'Overview of Reports — Objects report, trend columns, quality attributes (13035497995)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/13035497995.html' },
                                { label: 'Viewing Trend log Report data with Excel output (20077529739)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/20077529739.html' },
                                { label: 'Interval-based Trends Report — Time / Condition Filter (18163963147)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/18163963147.html' },
                                { label: 'Analyze the Trend Data — time range selection (23261571979)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/23261571979.html' },
                                { label: 'Configuring Basic Driver Settings — instance 9998, vendor IDs, APDU (22300262027)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/22300262027.html' },
                                { label: 'Configuring the BT BACnet Stack — port table, IP/UDP, BBMD (22300265867)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/22300265867.html' },
                                { label: 'Device Info — device instance, network number, MAC (22302734091)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/22302734091.html' },
                                { label: 'Configure Discovery Settings — network, instance and vendor filters (22415341195)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/22415341195.html' },
                                { label: 'BACnet Object Browser — Device Instance / Object Type / Object Instance / Property ID (13794732811)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/13794732811.html' },
                                { label: '3rd Party BACnet Integration — BACnet EDE module prerequisite (14124999691)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/14124999691.html' },
                                { label: 'Application Rights — Show / Configure / Export / Import / Execute (13997136139)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/13997136139.html' },
                                { label: 'License Modes — 30-minute Demo mode (13987774347)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/13987774347.html' },
                                { label: '3rd Party BACnet Troubleshooting (14128916619)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/14128916619.html' },
                                { label: 'Importing Siemens room devices with an EDE file — licence data points (22414103691)', url: 'https://mybuilding.siemens.com/d025938170736/help/engineeringhelp/en-us/22414103691.html' }
                            ]
                        }
                    ]
                }
            ]
        },
        jci: {
            title: "Johnson Controls Metasys — BACnet Point List Export",
            wide: true,
            footer: "Send the device sheet + point list to data@retragreen.com · Questions: support@retragreen.com",
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
            title: "Schneider EcoStruxure Building Operation — Point List &amp; Trend Export",
            wide: true,
            footer: "Send the device sheet + point list to data@retragreen.com · Questions: support@retragreen.com",
            blocks: [
                {
                    type: 'lead',
                    text: "Written for the site BMS engineer. In EcoStruxure Building Operation the point list comes from <strong>Search &rarr; Export to Excel</strong>, and history comes from the <strong>trend log list</strong> export. Steps below are verified against the EcoStruxure Building Operation 7.1 online help."
                },
                {
                    type: 'note',
                    title: 'Two different exports — send the right one',
                    text: "<strong>Search export</strong> = which objects exist, their type, description and properties. <strong>Trend log export</strong> = the values over time. A trend file cannot replace the point list — it has no object identifiers, so the series cannot be tied back to equipment."
                },
                {
                    type: 'note',
                    title: 'The 1000-result limit is the usual reason a point list comes back short',
                    tone: 'warn',
                    text: "Search stops at <strong>1000 results</strong> unless the corresponding option is kept clear, and the option is not remembered between sessions. Split large buildings by folder, by equipment, or by object type — one export per AHU / chiller / plant — otherwise you will silently hand over a partial list."
                },
                {
                    type: 'section',
                    title: '1 · What we need you to send',
                    blocks: [
                        {
                            type: 'table',
                            columns: ['Deliverable', 'Content', 'Why we need it'],
                            rows: [
                                ['<strong>A · Device &amp; network sheet</strong>', 'One row per BACnet device — identity and addressing (1.1)', 'Tells us who to talk to, and whether the points are reachable from outside the BMS'],
                                ['<strong>B · Point list / point mapping</strong>', 'One row per point — name, type, address, unit, read/write, purpose (1.2)', 'The mapping our data platform uses to name, unit and validate every series']
                            ]
                        },
                        {
                            type: 'section',
                            title: '1.1 · Device &amp; network sheet — one row per device',
                            blocks: [
                                {
                                    type: 'table',
                                    columns: ['Field', 'Where to read it in EcoStruxure', 'Note'],
                                    rows: [
                                        ['Site name', 'System tree &gt; site node', '—'],
                                        ['BACnet device identification number', 'Device Info Screen / Device Discovery Detail Screen &rarr; <strong>Object ID</strong>', 'Documented as the BACnet device identification number'],
                                        ['Vendor ID and vendor', 'Same screens &rarr; <strong>Vendor ID</strong>, <strong>Vendor</strong>', '—'],
                                        ['Model', 'Same screens &rarr; <strong>Model</strong>', '—'],
                                        ['Firmware version', 'Same screens &rarr; <strong>Firmware version</strong>', '—'],
                                        ['Serial number', 'Same screens &rarr; <strong>Serial number</strong>', 'Useful for matching the physical controller'],
                                        ['IP address', 'Same screens &rarr; <strong>IP address</strong>', '—'],
                                        ['UDP port, network number, protocol revision', '<em>Not shown in EcoStruxure Building Operation</em>', 'Take these from the device itself or from BACnet discovery tooling — do not guess them'],
                                        ['Per-point BACnet address', 'Object &rarr; General Information &rarr; Basic tab &rarr; <strong>Foreign address</strong>', 'Documented as the address to a non-EcoStruxure product, e.g. a BACnet device; can be added as a search column'],
                                        ['Number of objects in scope', 'Row count of the Search export (section 2)', '—']
                                    ]
                                },
                                {
                                    type: 'note',
                                    text: "The Device Info and Device Discovery Detail screens are documented under the SpaceLogic Operator Display section rather than under WorkStation. If you cannot see them, run <strong>Actions &gt; Discover Devices</strong> from the device-discovery area and open the discovery detail for the device."
                                }
                            ]
                        },
                        {
                            type: 'section',
                            title: '1.2 · Point list columns — one row per point',
                            blocks: [
                                {
                                    type: 'table',
                                    columns: ['Column', 'Meaning', 'Availability in the search export', 'Priority'],
                                    rows: [
                                        ['Tag (our name)', 'The name we will use in the data platform', 'You assign it', 'Required'],
                                        ['Name', 'Object name in the system', 'Add/Remove Columns &rarr; Name', 'Required'],
                                        ['Path', 'Full location path of the object in the tree', 'Add/Remove Columns &rarr; Path', 'Required'],
                                        ['Type', 'Object type (Analog Input, Analog Value…)', 'Add/Remove Columns &rarr; Type', 'Required'],
                                        ['Description', 'What the point measures or controls', 'Add/Remove Columns &rarr; Description', 'Required'],
                                        ['Foreign address', 'BACnet address of the point', 'Add/Remove Columns &rarr; Foreign address', 'Required for BACnet'],
                                        ['Units', 'Engineering units', 'Tick <strong>Search for properties</strong> and add the unit property as a column', 'Required'],
                                        ['Read / Write', 'Whether we may only read, or are also allowed to command', 'Object Properties access level; or your policy', 'Required'],
                                        ['Value', 'Liveness check', 'Current value from the object, or Search for properties', 'Recommended'],
                                        ['Executed by', 'Which server executes the object', 'Add/Remove Columns &rarr; Executed by', 'Recommended'],
                                        ['Property binding / retain level', 'How the property is bound and retained', 'Add/Remove Columns &rarr; Property binding, Property retain level', 'Recommended'],
                                        ['Note 1 / Note 2', 'Free-text notes sometimes used for engineering data', 'Add/Remove Columns &rarr; Note 1, Note 2', 'Optional'],
                                        ['Validation', 'Any range validation on the object', 'Add/Remove Columns &rarr; Validation', 'Optional']
                                    ]
                                },
                                {
                                    type: 'note',
                                    title: 'The export contains only the columns you added',
                                    text: "Search &rarr; Export to Excel writes <strong>exactly the visible columns</strong>. Vendor ID, model, firmware, UDP port and network number are never in that workbook — collect them separately from section 1.1. The List View context menu also has an Export, but that is for <strong>individual objects in the native EcoStruxure format</strong>, not a point list."
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '2 · Method A — Search &rarr; Export to Excel (the point list)',
                    blocks: [
                        {
                            type: 'steps',
                            items: [
                                "WorkStation: use the <strong>Search</strong> entry on the WorkStation toolbar. WebStation: select the folder, server or device in the system tree and click the <strong>magnifier</strong>.",
                                "On the <strong>General</strong> tab, type into the Search box. Wildcards work — <code>*</code> for any string and <code>?</code> for a single character, e.g. <code>*Temperature*</code>.",
                                "Set <strong>In folder</strong> to the server or root, and use <strong>Additional search locations &gt; Add</strong> to cover other branches.",
                                "Optionally tick <strong>Search for properties</strong> (needed to surface unit and value as columns) and <strong>Include subservers</strong>, then set <strong>Include types</strong> (for example <code>Analog Input</code>, <code>Analog Value</code>) and <strong>Conditions</strong> to narrow the result.",
                                "Keep <strong>Stop if more than 1000 results</strong> clear so you get the full set. If the result is genuinely large, narrow the search rather than truncating it.",
                                "Click <strong>Search</strong> to populate the result list.",
                                "Open <strong>Add/Remove Columns</strong> on the Search view and tick everything we need in section 1.2 — the export only carries what is visible here.",
                                "Click <strong>Export to Excel</strong> on the Search list toolbar, then save. Repeat per equipment group so no single export hits the 1000-result ceiling."
                            ]
                        },
                        {
                            type: 'note',
                            text: "Saved searches are created in WorkStation and are <strong>read-only in WebStation</strong> — prepare the search on the engineering client if you want to reuse it."
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '3 · Method B — Trend log list export (historical data)',
                    blocks: [
                        {
                            type: 'steps',
                            items: [
                                "<strong>WorkStation:</strong> in the system tree select the trend log list, then click <strong>Export to .CSV</strong> and choose the folder and file name.",
                                "<strong>WebStation:</strong> select the trend log list and use the <strong>Export to Excel</strong> or <strong>Export to XML</strong> button on the trend log list toolbar.",
                                "<strong>Multi trend log list:</strong> select it and choose <strong>Export to .XLSX</strong>; the toolbar also offers Export to .XML and Export to .CSV.",
                                "Set the period with the day / week / month / year buttons or the period selector, and pick the time zone — <strong>local, server or UTC</strong>. This matters: a mismatch shifts every series.",
                                "Open the file before sending it. Missing values appear as empty cells, and <code>NaN</code>, <code>INF</code> and <code>-INF</code> can appear in values — do not let them reach the analysis unnoticed."
                            ]
                        },
                        {
                            type: 'note',
                            title: 'Trend storage is circular — old data is overwritten',
                            tone: 'warn',
                            text: "All EcoStruxure trend logs use <strong>circular storing</strong>: once the log is full, the oldest records are overwritten. Capacity depends on the configuration. An <strong>Extended Trend Log</strong> moves records to larger storage (typically an Enterprise Server or Central), triggered by a Smart log, a percentage threshold, a maximum interval, a trigger variable, or a forced transfer. Ask early if you need more than the local retention — the history may already be gone."
                        },
                        {
                            type: 'note',
                            title: 'Extended trend log constraints',
                            text: "An extended trend log <strong>cannot log a variable</strong> itself, only one may be attached per trend log, and it must share the same unit as the trend log — a unit mismatch is a documented conflict. For BACnet and Xenta trend logs, the extended trend log must be created on the <strong>same server that hosts the device</strong>."
                        },
                        {
                            type: 'note',
                            title: 'Scheduled reports',
                            text: "Notification Reports can be generated on a trigger as text, XLSX or PDF, and can include search results, properties and trend log records. Record caps are <strong>5,000</strong> on a field server and <strong>100,000,000</strong> on an Enterprise Server / Central. Reports can be scheduled for delivery to registered email addresses at portfolio or site scope — this is the route for a recurring handover rather than a manual export."
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '4 · Checks before you send it',
                    blocks: [
                        {
                            type: 'checklist',
                            items: [
                                "Every export stayed under the 1000-result ceiling, or was deliberately split by equipment.",
                                "<strong>Search for properties</strong> was ticked where unit and value columns were needed — otherwise those columns simply do not exist.",
                                "<strong>Foreign address</strong> is in the column list. Without it there is no way to address the point over BACnet.",
                                "Time zone stated with the trend export, and the file checked for empty cells, <code>NaN</code>, <code>INF</code> and <code>-INF</code>.",
                                "Local trend retention is long enough for the period requested — remember the logs are circular.",
                                "Every point has a description and a unit. EcoStruxure installations frequently leave both blank, and we cannot derive them.",
                                "Report paths that will be scheduled use <strong>absolute</strong> paths — relative paths break when objects are moved or renamed."
                            ]
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '5 · Troubleshooting',
                    blocks: [
                        {
                            type: 'table',
                            columns: ['Symptom', 'Likely cause', 'Fix'],
                            rows: [
                                ['Search returns exactly 1000 objects', 'Stop if more than 1000 results is set, or the result is simply larger than the cap', 'Clear the option, or narrow the search by folder / equipment / object type and export in several files'],
                                ['Unit or value column missing from the export', 'Search for properties was not ticked', 'Tick Search for properties, then add the property as a column in Add/Remove Columns'],
                                ['No BACnet address on a point', 'Foreign address is not populated for that object', 'Read it from the object&rsquo;s General Information &gt; Basic tab; if it is empty, the point is not exposed to BACnet'],
                                ['A point has no history', 'The point is not on any trend log', 'Only points on a trend log appear in a trend log list — confirm the point is logged before requesting history'],
                                ['Old data missing from the export', 'Circular trend log overwrote the oldest records', 'Request earlier data before it is lost, and set up an extended trend log for retention'],
                                ['Extended trend log never transfers', 'Unit mismatch with the trend log, or it was created on a different server than the device', 'Match the unit exactly; for BACnet / Xenta create it on the server hosting the device'],
                                ['A gap in the data that looks wrong', 'Interval trend log with a delta — nothing is recorded while the value is inside the delta', 'Review the delta setting, or export the raw point values instead'],
                                ['Saved search is read-only', 'Saved searches are created in WorkStation', 'Prepare and save the search in WorkStation; it can only be read in WebStation'],
                                ['Scheduled report finds no data after a refit', 'The report used relative paths and objects were moved or renamed', 'Rebuild the report with absolute paths']
                            ]
                        }
                    ]
                },
                {
                    type: 'section',
                    title: '6 · Official Schneider Electric references',
                    blocks: [
                        {
                            type: 'refs',
                            items: [
                                { label: 'Searching for Objects or Properties — full search sequence and the 1000-result option (id 6897)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=6897&locale=en-US&productversion=7.1' },
                                { label: 'Search View — General tab options (id 6891)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=6891&locale=en-US&productversion=7.1' },
                                { label: 'Add/Remove Columns Dialog Box (Search) — the exportable column list (id 9754)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=9754&locale=en-US&productversion=7.1' },
                                { label: 'Search List Toolbar — Export to Excel, WorkStation (id 14041)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=14041&locale=en-US&productversion=7.1' },
                                { label: 'Exporting a Search to Excel, WebStation (id 13513)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=13513&locale=en-US&productversion=7.1' },
                                { label: 'Exporting a Trend Log List to CSV Format (id 5535)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=5535&locale=en-US&productversion=7.1' },
                                { label: 'Multi Trend Log List Toolbar — XML / CSV / XLSX and period selector (id 11240)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=11240&locale=en-US&productversion=7.1' },
                                { label: 'Exporting a Multi Trend Log List to .XLSX — time zones, fill values, NaN/INF (id 11917)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=11917&locale=en-US&productversion=7.1' },
                                { label: 'Trends Handling — circular storage and log types (id 15063)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=15063&locale=en-US&productversion=7.1' },
                                { label: 'Extended Trend Logs — transfer criteria and constraints (id 5546)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=5546&locale=en-US&productversion=7.1' },
                                { label: 'Creating an Interval Trend Log — interval, UTC alignment, delta (id 5108)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=5108&locale=en-US&productversion=7.1' },
                                { label: 'Notification Reports — formats, record caps, absolute vs relative paths (id 10803)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=10803&locale=en-US&productversion=7.1' },
                                { label: 'General Information Properties &ndash; Basic Tab — Foreign address, Executed by (id 5637)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=5637&locale=en-US&productversion=7.1' },
                                { label: 'Device Info Screen — Object ID, Vendor ID, Model, Firmware, IP, Serial (id 14241)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=14241&locale=en-US&productversion=7.1' },
                                { label: 'Device Discovery Detail Screen — same device fields (id 14243)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=14243&locale=en-US&productversion=7.1' },
                                { label: 'Actions Menu — Discover Devices, device communication and diagnostics (id 8225)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=8225&locale=en-US&productversion=7.1' },
                                { label: 'Object Properties — access methods and read-only vs read/write (id 6432)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=6432&locale=en-US&productversion=7.1' },
                                { label: 'WebStation — client platforms and licensing model (id 8792)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=8792&locale=en-US&productversion=7.1' },
                                { label: 'Engineering Tools Overview — Text Reports, Spreadsheet, Import and Export (id 9699)', url: 'https://ecostruxure-building-help.se.com/bms/topics/show.castle?id=9699&locale=en-US&productversion=7.1' }
                            ]
                        }
                    ]
                }
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
                case 'figure':
                    return `<figure class="guide-figure"><a class="guide-figure-link" href="${block.src}" target="_blank" rel="noopener noreferrer" title="Open full size"><img src="${block.src}" alt="${block.alt}" loading="lazy"></a><figcaption>${block.caption}</figcaption></figure>`;
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
        const footer = data.footer || 'Need help? Contact support@retragreen.com';
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
                        "For BACnet sites (incl. Johnson Controls Metasys): can a point list / point mapping table be exported, with object name, object type, instance and units? (see BMS Guide)",
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
