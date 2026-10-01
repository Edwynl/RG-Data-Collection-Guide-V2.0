# Johnson Controls Metasys — BACnet Point List & Point Mapping Export

**For:** Site BMS engineer
**From:** Retragreen data onboarding
**Applies to:** Metasys Release 8.x – 17.x (Metasys UI, BACnet Workstation ODS, Site Management Portal, SCT)
**Version:** 1.0 — 1 October 2026

---

## 0 · Read this first: two different exports

| Export | What it is | When you need it |
| --- | --- | --- |
| **① Point list / point mapping** | Which points exist, where they live, what they mean, how they are addressed over BACnet | **First.** Nothing can be collected or analysed without it |
| **② Historical trend data** | The actual values over time | After the point list is agreed |

A trend export cannot replace the point list: trend files carry no object identifiers, so the
numbers cannot be mapped back to equipment. Please send **both**, but send ① first.

---

## 1 · What we need you to send

| | Deliverable | Content | Why we need it |
| --- | --- | --- | --- |
| **A** | Device & network sheet | One row per BACnet device — identity and addressing (1.1) | Tells us who to talk to, and whether the points are reachable from outside the BMS |
| **B** | Point list / point mapping | One row per point — name, object type, instance, units, read/write, purpose (1.2) | The mapping our data platform uses to name, unit and validate every series |

### 1.1 · Device & network sheet — one row per device

| Field | Where to find it in Metasys | Example |
| --- | --- | --- |
| Site name | Navigation Tree / Site Object | HQ — Tower A |
| Device Object Name | BACnet Device object → Object Name attribute | NAE-01 |
| Device Instance (BACnet Object Identifier) | Device object → Instance (select **Advanced** on the Focus / Network tab) | Device, 12 |
| Vendor ID / Vendor Name | BACnet Device object attributes (ASHRAE vendor code) | 17 / Johnson Controls |
| Model Name | BACnet Device object attribute | NAE8500 |
| Firmware Revision / Application Software Version | BACnet Device object attributes | 12.0.8 / 4.2 |
| BACnet IP address & UDP port | Device object → BACnet IP Port (Advanced view) | 10.20.30.40 / 47808 |
| Protocol Version / Services / Object Types supported | BACnet Device object attributes | Rev 19 / COV, ReadProperty… |
| BBMD (only if on another subnet) | Site Object → BACnet section → third-party BBMD attribute | 10.20.31.1 |
| Number of exposed objects | Advanced Search result count (section 2) | 1,284 |

> The BACnet Device object holds the external, visible characteristics of a device, and only one
> Device object exists in each BACnet device. The Johnson Controls network engine device object
> also carries attributes and methods beyond the standard set — in the software its object type is
> labelled **Non-FEC BACnet Device**.

### 1.2 · Point list columns — one row per point

| Column | Meaning | Where it comes from in Metasys | Priority |
| --- | --- | --- | --- |
| Tag (our name) | The name we will use in the data platform | You assign it | Required |
| Object Name (native) | BACnet Object Name held in the device | Advanced Search → Name/Label | Required |
| Object Type | Analog Input / Output, Binary Input / Output, Multi-state, Trend Log, Schedule… | Advanced Search → Type | Required |
| Instance Number | Instance part of the BACnet Object Identifier | Point Configuration → Hardware tab (SCT), or Advanced view | Required for BACnet |
| Item Reference | Unique Metasys reference of the object | Advanced Search → Item Reference | Required |
| Description | What the point measures or controls | Advanced Search → Description | Required |
| Units | Engineering units (°C, kW, m³/h, %RH) | Advanced Search → Units | Required |
| Read / Write | Whether we may only read, or are also allowed to command | Point properties / your policy | Required |
| Present value & status | Sanity check that the point is alive and not Out of Service | Advanced Search → Value, Status | Recommended |
| Space / Equipment | Grouping used to label the series | Advanced Search → Spaces and Equipment | Recommended |
| Trend available? | Historical logging yes/no, plus interval | Trend log objects / your policy | Recommended |
| Point source | native / integrated / derived-virtual | Your confirmation | Recommended |

### 1.3 · CSV template — copy this header

```csv
Tag,Object Name (native),Object Type,Instance Number,Item Reference,Description,Units,Read/Write,Present Value,Status,Space,Equipment,Trend Available,Point Source
CHLR1_LCHWT_C,CHLR-1 Leaving CHW Temp,Analog Input,1201,CHLR-1.LCHWT,Chiller 1 leaving chilled water temperature,degC,Read,7.2,Normal,Plant Room,Chiller 1,N/A,native
CHLR1_STATUS,CHLR-1 Run Status,Binary Input,1202,CHLR-1.STATUS,Chiller 1 run feedback,0/1,Read,1,Normal,Plant Room,Chiller 1,N/A,native
CHLR1_POWER_KW,CHLR-1 Power Meter,Analog Input,1203,CHLR-1.KW,Chiller 1 active power, kW,Read,412.6,Normal,Plant Room,Chiller 1,5 min,native
CHLR1_LOAD_PCT,CHLR-1 Load Calc,Analog Input,1204,CHLR-1.LOAD,Chiller 1 load percentage,%,Read,78,Normal,Plant Room,Chiller 1,N/A,derived
```

> Use `degC` in the CSV if your tooling struggles with `°`, and keep one unit per column — mixed
> units inside a column are the single most common cause of corrupted energy analysis.

---

## 2 · Method A — Metasys UI (Release 12.1 and later) ★ recommended

1. Open Metasys UI on a **PC**. Data export is not supported on tablets or smartphones.
2. Open the **User menu** → **Advanced Search & Reporting**.
3. Build the search with the five filters: Space & Equipment, Name/Label, Object Type, Equipment
   Definition, Search Locations. Wildcards work, e.g. Name/Label `*CHW*`.
4. Leave **Exclude Extensions** clear to also list trend, alarm, totalization, load and averaging
   objects; tick it when you want the points only.
5. Run the search, then click the **Export** button to write a `.csv`. Select rows first if you
   only want part of the result.
6. Repeat per system (water / air / electrical) and per site. Save as
   `SiteName_PointList_YYYYMMDD.csv`, UTF-8.
7. On Servers you can also export PDF and schedule reports: select the results → ACTIONS →
   Create Report → Report Type, Date Range, Format → Download immediately or Send to an email
   address / network location → set Repeat. Saved searches stay available on the Saved From
   Search tab.

> **What this CSV does not contain.** The export carries exactly the results columns — Type,
> Name/Label, Item Reference, Value, Units, Status, Description, Authorization Category, Spaces and
> Equipment. It does **not** carry the BACnet object instance. Add that column yourself from the
> point configuration (section 4, step 4), otherwise we cannot address the point over BACnet.

---

## 3 · Method B — BACnet Workstation ODS / Site Management Portal (Metasys 8.x – 11.x)

1. Log in to the Site Management Portal, or to BACnet Workstation ODS on the ODS server.
2. **Queries → Global Search**. Set Object Type to **All (except extensions)**, add your criteria,
   then click Search.
3. The Search Results table is your object list. To keep it, right-click the Global Search Viewer
   title bar — or use **Queries → Save Object List** — give it a unique Name, choose the Category,
   then Save. The list is stored on the Site Director, not as a spreadsheet.
4. To get a spreadsheet: select the rows in the Search Results table, copy to the clipboard and
   paste into Excel — or print the Search Results table. Object list files live in
   `C:\ProgramData\Johnson Controls\MetasysIII\File Transfer\Object Lists`.
5. Re-use the saved object list for scheduled reports and global commands instead of re-running
   the search every time.

> **Object lists are not backed up.** They are not saved when the database is backed up, and they
> are deleted when the database is restored — keep your own copy of the list file. Sorting order is
> not stored in the object list either.

---

## 4 · Method C — SCT: structure export and mapping check

1. Open the site archive database in SCT. SCT edits the archive copy — it never changes the live
   system directly.
2. **Confirm BACnet is exposed:** right-click the **Site Object** → **View** → in the Site View
   click **Advanced** on the right, click **Edit** on the left and scroll to the BACnet section
   (visible only with Advanced selected) → set **BACnet Site** = True and the **BACnet Encoding
   Type** used by the BACnet devices → **Save**.
3. **Export the point structure:** in the navigation tree select the source item — it must sit
   below the Site object, since a whole site cannot be exported as one item — then **Item menu →
   Export Item**, enter a unique file name and click Finish. The file is written to
   `C:\ProgramData\Johnson Controls\MetasysIII\DatabaseFiles`. Note the Reference, Class and Class
   Version shown in the Notice Information dialog; the export does not change the instance number,
   host name or IP address of a device.
4. **Read the BACnet instance numbers:** for each point, the **Instance Number** on the
   Configuration screen's **Hardware** tab must match the instance of the BACnet Object Identifier
   in the host BACnet device. Click **Advanced** to see the full BACnet object identifier.
5. **Map or remap points where needed:** **Insert → Field Points** → select the BACnet device →
   Next → **Assisted** → **Invoke Auto Discovery**. The supervisory controller must be online with
   the devices on the BACnet/IP network. Auto discovery fills the Native Object Name from the BACnet
   Object Name and the Instance Number from the BACnet Object Identifier; double-click points
   individually or use **Map All** → Next → Finish. When working offline choose **Manual** and
   enter the object type and instance instead.
6. **If a value you need does not exist as a native BACnet object**, it has to be created in Metasys
   first — for example with Logic Connector Tool logic blocks (Bool category: AND 2–8, OR 2–8,
   XOR 2, NOT 1, LTCH latch, plus the arithmetic and timing categories) — and then mapped as a
   field point. Mark such rows **derived / virtual** in the point list.

> SCT exports are Metasys archive items, not spreadsheets. Use them to review structure and
> mapping; the handover file is still the CSV point list.

---

## 5 · Eight checks before you send it

- [ ] Every BACnet Object Identifier on the network is unique, including the one of the supervisory
      controller itself. Check the **Duplicate Device Identifiers** attribute on the BACnet
      Integration object (Diagnostic view).
- [ ] **BACnet Site** = True on the Site Object, and the **BACnet Encoding Type** matches the BACnet
      devices in the field.
- [ ] **BACnet Integrated Objects** = *Include in Object List*, if we must read third-party points
      that Metasys has integrated (BACnet Routing section of the device object: Focus tab on
      Servers, Network tab on engines).
- [ ] **Routing Mode** = *Enabled Without Broadcasts* on routed networks, so third-party devices
      outside the network do not discover routed devices by broadcast and end up seeing each object
      twice.
- [ ] A BBMD exists for every subnet that is not the supervisory controller segment, and its IP is
      in the third-party BBMD attribute of the Site object.
- [ ] The field devices answer the **Who-Is** service — auto discovery cannot see devices that do not.
- [ ] Units, Description and read/write status are filled in. We cannot derive them, and wrong units
      silently ruin the analysis.
- [ ] Trend availability is confirmed per point (yes/no plus interval) — otherwise we plan to poll
      every 5–15 minutes.

---

## 6 · Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Auto discovery finds no or few devices | BACnet Network Address or BACnet IP Port mismatch; wrong MS/TP Network Address | Match the BACnet IP Port on the device object (Advanced view) and the MS/TP Network Address on the Hardware tab |
| Auto discovery returns duplicate devices | Two devices share a BACnet Object Identifier | Read Duplicate Device Identifiers on the BACnet Integration object (Diagnostic view) and renumber the duplicates |
| Devices on another subnet stay invisible | No BBMD for that segment | Add the BBMD device IP to the third-party BBMD attribute of the Site object |
| A device never appears in discovery | It does not support Who-Is, or a discovery filter blocks it | Map it manually, or use a BACnet browser, and review any discovery filter settings |
| A third-party client sees the same point twice | BACnet Integrated Objects = Include in Object List together with Routing Mode = Enabled | Set Routing Mode to Enabled Without Broadcasts |
| A point is visible in Metasys but not from outside | BACnet Integrated Objects = Exclude from Object List, or no read access / point is Out of Service | Set Include in Object List, clear Out of Service and confirm read permission |
| Export button does nothing | Running on a tablet or phone | Repeat the export from a PC |
| Point reads fail after manual mapping | Instance Number entered on the wrong tab, or not matching the host device | Re-enter it on the Configuration screen Hardware tab and verify with Advanced |

---

## 7 · Historical trend data (separate deliverable)

1. Log into the Metasys Site Management Portal (SMP).
2. Use the *Trend Study* tool to select your points.
3. Define the time range for historical data (last 12 months minimum).
4. Click *Export* and select *Comma Separated Values* (CSV).
5. Ensure date/time formatting is consistent (YYYY-MM-DD HH:MM).
6. Download the generated file.

> For long histories, the **Metasys Export Utility** extracts trend, alarm and audit data from the
> Network Engine or ADS/ADX into Microsoft Excel (`.xls`) or Access (`.mdb`) files, immediately or
> on a schedule — use it instead of repeated manual exports.

---

## 8 · Official Johnson Controls references

| Topic | Document |
| --- | --- |
| BACnet Device Attributes (device identity, vendor ID, model, protocol) | [SCT Help 17.1 — LIT-12011964](https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/SCT-System-Configuration-Tool-Help/17.1/Insert-Menu/Field-Device/BACnet-Device-Object/BACnet-Device-Attributes) |
| BACnet Device Object (one device object per BACnet device) | [SCT Help 17.1 — LIT-12011964](https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/SCT-System-Configuration-Tool-Help/17.1/Insert-Menu/Field-Device/BACnet-Device-Object) |
| Logic blocks — Bool category (AND / OR / XOR / NOT / LTCH) | [SCT Help 16.0 — LIT-12011964](https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/SCT-System-Configuration-Tool-Help/16.0/Insert-Menu/Program-Object/Logic-Connector-Tool-LCT/Logic-Connector-Tool-Concepts/Logic/Logic-Blocks/Bool-Category) |
| Exposing BACnet information (BACnet Site, Encoding Type) | [BACnet Controller Integration TB 15.0 — LIT-1201531](https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/BACnet-Controller-Integration-Technical-Bulletin/15.0/Detailed-procedures/Exposing-BACnet-information) |
| Mapping BACnet Field Points using Auto Discovery | [BACnet Controller Integration TB 14.1 — LIT-1201531](https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/BACnet-Controller-Integration-Technical-Bulletin/14.1/Detailed-procedures/Mapping-BACnet-Field-Points-using-Auto-Discovery) |
| Mapping BACnet Field Points manually | [BACnet Controller Integration TB 15.0 — LIT-1201531](https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/BACnet-Controller-Integration-Technical-Bulletin/15.0/Detailed-procedures/Mapping-BACnet-Field-Points-manually) |
| BACnet System Integration troubleshooting guide | [BACnet Controller Integration TB 14.0 — LIT-1201531](https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/BACnet-Controller-Integration-Technical-Bulletin/14.0/Troubleshooting/BACnet-System-Integration-troubleshooting-guide) |
| BACnet Integrated Objects attribute (Include / Exclude from Object List) | [Metasys UI Help 15.0 — LIT-12011953](https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/Metasys-UI-Help/15.0/Metasys-UI-and-BACnet-Advanced-Operator-Workstation/Managing-BACnet-devices-and-networks/BACnet-Integrated-Objects-attribute-in-Server-or-engine-device-objects) |
| Advanced Search & Reporting (point list export) | [Metasys UI Help 7.0 — LIT-12011953](https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/Metasys-UI-Help/7.0/Navigating-and-searching/Advanced-search-reporting-bulk-commanding-and-bulk-modifying/Advanced-Search) |
| Export Item (archive structure export) | [SCT Help 14.1 — LIT-12011964](https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/SCT-System-Configuration-Tool-Help/14.1/Item-Menu/Export-Item) |
| Saving an Object List (legacy ODS / SMP) | [Site Management Portal Help 11.0 — LIT-1201793](https://docs.johnsoncontrols.com/bas/r/Metasys/en-US/Metasys-Site-Management-Portal-Help/11.0/Query-Menu/Saving-an-Object-List) |

---

## 附录 · 中文速查版

**要客人交两样东西：**

1. **设备清单（每台 BACnet 设备一行）**：站点名、设备对象名称、Device Instance（对象标识符）、
   Vendor ID / Vendor Name、Model Name、固件版本、BACnet IP 与 UDP 端口、BBMD（如跨网段）、
   已开放对象数量。
2. **点位清单（每个点位一行）**：Tag（我们用的名字）、原生 Object Name、Object Type、
   **Instance Number（关键）**、Item Reference、Description、**Units（关键）**、读/写、
   当前值与状态、区域/设备、是否有趋势（是/否＋间隔）、点位来源（原生/集成/虚拟计算）。

**Metasys UI（12.1 及以后，推荐）：**
User 菜单 → Advanced Search & Reporting → 用五个筛选条件（Space & Equipment、Name/Label、
Object Type、Equipment Definition、Search Locations）搜索 → 点 **Export** 导出 `.csv`。
**必须在电脑上做，平板和手机不支持导出。**

⚠️ 导出的 CSV 只有 Type、Name/Label、Item Reference、Value、Units、Status、Description、
Authorization Category、Spaces and Equipment，**不含 BACnet 的 Instance Number**，需要另外从点位
配置里补上，否则我们无法用 BACnet 定位这个点。

**老版本（ODS / SMP 8.x–11.x）：**
Queries → Global Search → Object Type 选 *All (except extensions)* → Search →
右键 Global Search Viewer 标题栏 → Save Object List（存在 Site Director 上，不是 Excel）；
要表格就复制 Search Results 粘贴到 Excel。Object List **不会随数据库备份保存**，请自行留档。

**SCT：** 打开站点档案库 → 确认 Site Object 的 BACnet Site = True 且 Encoding Type 正确 →
Item 菜单 → Export Item 导出结构（文件在 `C:\ProgramData\Johnson Controls\MetasysIII\DatabaseFiles`）
→ 每个点的 Instance Number 要填在 Configuration 的 **Hardware** 页签上，且必须与现场设备里
BACnet Object Identifier 的 instance 一致 → 需要新增映射时用 Insert → Field Points →
Assisted → Invoke Auto Discovery（要求控制器与 BACnet/IP 设备在线）或 Manual 手填。
原生 BACnet 里没有的数值（例如能耗、COP）必须先在 Metasys 里用 LCT 逻辑块
（Bool：AND 2–8、OR 2–8、XOR 2、NOT 1、LTCH）做出来，再映射为 Field Point，并在清单里标注
**derived / virtual**。

**交件前必查 8 项：** 全网 Object Identifier 不重复（含控制器自身）· BACnet Site = True ·
BACnet Integrated Objects = Include in Object List · 路由网络用 Enabled Without Broadcasts ·
跨网段有 BBMD · 设备支持 Who-Is · 单位/描述/读写权限填齐 · 确认每点是否有趋势。

**最常见的坑：** Metasys 里看得见的点，第三方用 BACnet 未必读得到——检查
BACnet Integrated Objects 是否为 *Exclude from Object List*、点位是否 Out of Service、
以及 Routing Mode 是否为 *Enabled*（会导致同一个点被第三方读到两次）。
