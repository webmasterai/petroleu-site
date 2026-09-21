/**
 * Additive Afghanistan blog + content parity migration.
 * - Creates en-AF / fa-AF / ps-AF blog posts from PK published posts (structure copy + translations)
 * - Fixes en-AF "[Translation required]" section titles
 * - Syncs FAQ-page items from home FAQ topics for AF locales
 * Does NOT delete existing rows or touch users.json / seed.
 */
const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '..', 'petroleu-next', 'storage', 'data')
const blogFile = path.join(dataDir, 'blog-posts.json')
const sectionsFile = path.join(dataDir, 'sections.json')

const blog = JSON.parse(fs.readFileSync(blogFile, 'utf8'))
const sections = JSON.parse(fs.readFileSync(sectionsFile, 'utf8'))
const changes = []

let maxBlogId = Math.max(0, ...blog.map((b) => Number(b.id) || 0))
let maxSectionId = Math.max(0, ...sections.map((s) => Number(s.id) || 0))
const nextBlogId = () => ++maxBlogId
const nextSectionId = () => ++maxSectionId

/** @type {Record<string, { en: {title:string,excerpt:string,content:string,category:string}, fa: {title:string,excerpt:string,content:string,category:string}, ps: {title:string,excerpt:string,content:string,category:string} }>} */
const TR = {
  'petroleu-dashboard-overview': {
    en: {
      title: 'Petroleu Dashboard Overview',
      excerpt: 'See today’s sales, cash, credit, stock, and key pump metrics from the Petroleu dashboard.',
      content:
        'This clip shows the Petroleu dashboard view that owners and managers open at the start of the day.\n\nSales, cash, credit, stock, and receivable figures appear in one place so you can review fuel station performance without opening separate registers.',
      category: 'Video',
    },
    fa: {
      title: 'نمای کلی داشبورد Petroleu',
      excerpt: 'فروش امروز، نقد، اعتبار، موجودی و شاخص‌های کلیدی پمپ را از داشبورد Petroleu ببینید.',
      content:
        'این ویدیو نمای داشبورد Petroleu را نشان می‌دهد که مالکان و مدیران در شروع روز باز می‌کنند.\n\nفروش، نقد، اعتبار، موجودی و مطالبات در یک جا دیده می‌شود تا عملکرد پمپ تیل بدون دفترهای جداگانه بررسی شود.',
      category: 'ویدیو',
    },
    ps: {
      title: 'د Petroleu ډشبورډ کتنه',
      excerpt: 'د نن ورځې پلور، نغدي، اعتبار، موجودي او د پمپ مهم شاخصونه د Petroleu ډشبورډ څخه وګورئ.',
      content:
        'دا کليپ د Petroleu ډشبورډ ښيي چې خاوندان او مدیران د ورځې په پیل کې پرانيزي.\n\nپلور، نغدي، اعتبار، موجودي او پورونه په یو ځای کې ښکاري ترڅو د سون توکو پمپ فعالیت پرته له جلا ثبتونو وکتل شي.',
      category: 'ویډیو',
    },
  },
  'petroleu-sales-summary': {
    en: {
      title: 'Sales Summary in Petroleu',
      excerpt: 'Review petrol, diesel, and other fuel sales totals with shift-wise and day-wise figures in one summary.',
      content:
        'This clip walks through the sales summary section where nozzle readings roll up into product-wise totals.\n\nOwners can check how much fuel was sold during the day before moving to cash, credit, and closing review.',
      category: 'Video',
    },
    fa: {
      title: 'خلاصه فروش در Petroleu',
      excerpt: 'جمع فروش پطرول، دیزل و دیگر سوخت‌ها را با ارقام شیفتی و روزانه در یک خلاصه ببینید.',
      content:
        'این ویدیو بخش خلاصه فروش را نشان می‌دهد که خوانش نوزل‌ها به مجموعه‌های محصولی تبدیل می‌شود.\n\nمالکان می‌توانند پیش از بررسی نقد، اعتبار و بستن روز ببینند چقدر سوخت فروخته شده است.',
      category: 'ویدیو',
    },
    ps: {
      title: 'په Petroleu کې د پلور لنډیز',
      excerpt: 'د پټرول، ډیزل او نورو سون توکو د پلور ټولټالونه په یوه لنډیز کې د شفټ او ورځې په ارقامو سره وګورئ.',
      content:
        'دا کليپ د پلور لنډیز برخه ښيي چیرې چې د نوزل لوستونه په محصولي ټولټالونو بدلیږي.\n\nخاوندان کولی شي مخکې له نغدي، اعتبار او بندښت څخه وګوري چې څومره سون توکي پلورل شوي.',
      category: 'ویډیو',
    },
  },
  'petroleu-cash-receivables': {
    en: {
      title: 'Cash & Receivables Overview',
      excerpt: 'Track cash in hand, credit outstanding, and customer receivables from the same daily view.',
      content:
        'This clip shows how Petroleu separates cash collections from credit customer balances.\n\nManagers can see what was collected in hand and what remains outstanding before closing the shift.',
      category: 'Video',
    },
    fa: {
      title: 'نمای کلی نقد و مطالبات',
      excerpt: 'نقد در دست، اعتبار باقی‌مانده و مطالبات مشتریان را از همان نمای روزانه دنبال کنید.',
      content:
        'این ویدیو نشان می‌دهد چگونه Petroleu وصول نقدی را از مانده مشتریان اعتباری جدا می‌کند.\n\nمدیران می‌توانند پیش از بستن شیفت ببینند چه مبلغی نقد جمع شده و چه چیزی باقی مانده است.',
      category: 'ویدیو',
    },
    ps: {
      title: 'د نغدي او پورونو کتنه',
      excerpt: 'په لاس کې نغدي، پاتې اعتبار او د پیرودونکو پورونه له همدې ورځني کتنې څخه تعقیب کړئ.',
      content:
        'دا کليپ ښيي چې Petroleu څنګه د نغدي راټولونه له اعتباري پیرودونکو بیلانس څخه جلا ساتي.\n\nمدیران کولی شي مخکې له شفټ بندښت څخه وګوري څومره نغدي راټول شوي او څومره پاتې دي.',
      category: 'ویډیو',
    },
  },
  'petroleu-stock-summary': {
    en: {
      title: 'Stock Summary Report',
      excerpt: 'Check opening stock, purchases, nozzle sales, and closing stock for each fuel product.',
      content:
        'This clip covers the stock summary where book stock, sales movement, and closing levels are visible by product.\n\nIt helps owners compare system stock with dipping records during daily operations.',
      category: 'Video',
    },
    fa: {
      title: 'گزارش خلاصه موجودی',
      excerpt: 'موجودی آغاز، خریدها، فروش نوزل و موجودی پایان را برای هر محصول سوخت بررسی کنید.',
      content:
        'این ویدیو خلاصه موجودی را پوشش می‌دهد که موجودی دفتری، حرکت فروش و سطح پایانی به تفکیک محصول دیده می‌شود.\n\nبه مالکان کمک می‌کند موجودی سیستم را با اندازه‌گیری تانک در عملیات روزانه مقایسه کنند.',
      category: 'ویدیو',
    },
    ps: {
      title: 'د موجودي لنډیز راپور',
      excerpt: 'د هر سون محصول لپاره پرانیستونکې موجودي، پیرود، د نوزل پلور او بندونکې موجودي وګورئ.',
      content:
        'دا کليپ د موجودي لنډیز پوښي چیرې چې دفتری موجودي، د پلور حرکت او بندښت کچه د محصول له مخې ښکاري.\n\nخاوندانو ته مرسته کوي چې د سیستم موجودي د ورځني عملیاتو پر مهال د ټانک اندازه‌ګیرۍ سره پرتله کړي.',
      category: 'ویډیو',
    },
  },
  'petroleu-tank-stock-levels': {
    en: {
      title: 'Tank Stock Levels',
      excerpt: 'View live petrol, diesel, and other fuel tank levels alongside dip readings and stock variance.',
      content:
        'This clip shows tank stock levels so operators can monitor remaining fuel and variance against book stock.\n\nClear tank visibility reduces surprises during shift handover and purchasing decisions.',
      category: 'Video',
    },
    fa: {
      title: 'سطح موجودی تانک‌ها',
      excerpt: 'سطح زنده تانک پطرول، دیزل و دیگر سوخت‌ها را همراه با اندازه‌گیری و اختلاف موجودی ببینید.',
      content:
        'این ویدیو سطح موجودی تانک را نشان می‌دهد تا اپراتورها سوخت باقی‌مانده و اختلاف با موجودی دفتری را پایش کنند.\n\nدید واضح تانک در تحویل شیفت و تصمیم خرید غافلگیری را کم می‌کند.',
      category: 'ویدیو',
    },
    ps: {
      title: 'د ټانک موجودي کچې',
      excerpt: 'د پټرول، ډیزل او نورو سون توکو ژوندۍ ټانک کچې د اندازه‌ګیرۍ او موجودي توپیر سره وګورئ.',
      content:
        'دا کليپ د ټانک موجودي کچې ښيي ترڅو چلونکي پاتې سون توکي او د دفتری موجودي سره توپیر وڅاري.\n\nروښانه ټانک لید د شفټ سپارلو او پیرود پرېکړو کې ناڅاپي ستونزې کموي.',
      category: 'ویډیو',
    },
  },
  'petroleu-daily-performance': {
    en: {
      title: 'Daily Pump Performance',
      excerpt: 'Review daily station performance including sales trends, cash position, and stock movement.',
      content:
        'This clip highlights the daily performance view that brings sales, cash, and stock signals together.\n\nManagers can spot weak shifts early and keep the station on target.',
      category: 'Reports',
    },
    fa: {
      title: 'عملکرد روزانه پمپ',
      excerpt: 'عملکرد روزانه ایستگاه شامل روند فروش، وضعیت نقد و حرکت موجودی را بررسی کنید.',
      content:
        'این ویدیو نمای عملکرد روزانه را نشان می‌دهد که سیگنال‌های فروش، نقد و موجودی را کنار هم می‌آورد.\n\nمدیران می‌توانند شیفت‌های ضعیف را زود ببینند و پمپ را در مسیر هدف نگه دارند.',
      category: 'گزارش‌ها',
    },
    ps: {
      title: 'د پمپ ورځنی فعالیت',
      excerpt: 'د سټیشن ورځنی فعالیت د پلور بهیر، نغدي وضعیت او موجودي حرکت سره وګورئ.',
      content:
        'دا کليپ ورځنی فعالیت ښيي چې پلور، نغدي او موجودي نښې یوځای راوړي.\n\nمدیران کولی شي کمزوري شفټونه ژر وویني او پمپ په هدف کې وساتي.',
      category: 'راپورونه',
    },
  },
  'petrol-pump-automation-dispenser-integration': {
    en: {
      title: 'Fuel Station Automation with Dispenser Integration',
      excerpt: 'See how dispenser integration reduces manual nozzle entry and speeds up daily operations.',
      content:
        'This clip explains dispenser integration for automated nozzle capture.\n\nLess manual typing means fewer mistakes and faster shift closing for fuel stations across Afghanistan.',
      category: 'Automation',
    },
    fa: {
      title: 'اتوماسیون پمپ با اتصال دیسپنسر',
      excerpt: 'ببینید اتصال دیسپنسر چگونه ثبت دستی نوزل را کم و عملیات روزانه را سریع‌تر می‌کند.',
      content:
        'این ویدیو اتصال دیسپنسر برای ثبت خودکار نوزل را توضیح می‌دهد.\n\nثبت کمتر دستی یعنی خطای کمتر و بستن سریع‌تر شیفت برای پمپ‌های تیل در افغانستان.',
      category: 'اتوماسیون',
    },
    ps: {
      title: 'د دیسپنسر یوځای کولو سره د پمپ اتوماتیک کول',
      excerpt: 'وګورئ چې د دیسپنسر یوځای کول څنګه د نوزل لاسي ثبت کموي او ورځني عملیات چټکوي.',
      content:
        'دا کليپ د نوزل اتوماتیک ثبت لپاره د دیسپنسر یوځای کول تشریح کوي.\n\nلږ لاسي لیکنه یعنې لږ تېروتنې او په افغانستان کې د سون توکو پمپونو لپاره چټک شفټ بندښت.',
      category: 'اتوماتیک کول',
    },
  },
  'atg-tank-monitoring-fuel-stations': {
    en: {
      title: 'ATG Tank Monitoring for Fuel Stations',
      excerpt: 'Monitor tank levels automatically and reduce stock surprises with ATG-ready workflows.',
      content:
        'This clip covers ATG-oriented tank monitoring so stations can track product levels with less manual dipping.\n\nBetter visibility supports safer purchasing and leak awareness.',
      category: 'Tank Automation',
    },
    fa: {
      title: 'نظارت تانک ATG برای پمپ‌های تیل',
      excerpt: 'سطح تانک را خودکار پایش کنید و با گردش‌کارهای آماده ATG غافلگیری موجودی را کم کنید.',
      content:
        'این ویدیو نظارت تانک مبتنی بر ATG را پوشش می‌دهد تا ایستگاه‌ها سطح محصول را با اندازه‌گیری دستی کمتر دنبال کنند.\n\nدید بهتر از خرید ایمن‌تر و آگاهی از نشتی پشتیبانی می‌کند.',
      category: 'اتوماسیون تانک',
    },
    ps: {
      title: 'د سون توکو پمپونو لپاره د ATG ټانک څارنه',
      excerpt: 'د ټانک کچې په اتوماتیک ډول وڅارئ او د ATG چمتو بهیر سره د موجودي ناڅاپي کم کړئ.',
      content:
        'دا کليپ د ATG پر بنسټ د ټانک څارنه پوښي ترڅو سټیشنونه د لږ لاسي اندازه‌ګیرۍ سره د محصول کچې تعقیب کړي.\n\nښه لید خوندي پیرود او د لیکې پوهاوي ملاتړ کوي.',
      category: 'د ټانک اتوماتیک کول',
    },
  },
  'ai-reporting-business-analysis-petrol-pumps': {
    en: {
      title: 'AI Reporting & Business Analysis for Fuel Stations',
      excerpt: 'Use AI-assisted reporting to understand station trends and make faster ownership decisions.',
      content:
        'This clip introduces AI-assisted reporting for fuel station owners who want clearer business analysis.\n\nTurn daily numbers into practical insights for sales, stock, and receivables.',
      category: 'AI Reports',
    },
    fa: {
      title: 'گزارش‌گیری هوش مصنوعی و تحلیل کسب‌وکار برای پمپ‌ها',
      excerpt: 'با گزارش‌های مبتنی بر هوش مصنوعی روند پمپ را بفهمید و سریع‌تر تصمیم بگیرید.',
      content:
        'این ویدیو گزارش‌گیری مبتنی بر هوش مصنوعی را برای مالکان پمپ معرفی می‌کند که تحلیل واضح‌تر می‌خواهند.\n\nارقام روزانه را به بینش عملی برای فروش، موجودی و مطالبات تبدیل کنید.',
      category: 'گزارش‌های هوش مصنوعی',
    },
    ps: {
      title: 'د سون توکو پمپونو لپاره د AI راپورونه او سوداګریز تحلیل',
      excerpt: 'د AI مرسته‌ییزو راپورونو سره د سټیشن بهیر وپوهېږئ او چټکې پرېکړې وکړئ.',
      content:
        'دا کليپ د سون توکو پمپ خاوندانو لپاره د AI مرسته‌ییز راپورونه معرفي کوي چې روښانه تحلیل غواړي.\n\nورځني ارقام په عملي بصیرت بدل کړئ د پلور، موجودي او پورونو لپاره.',
      category: 'د AI راپورونه',
    },
  },
  'whatsapp-invoices-payment-reminders': {
    en: {
      title: 'WhatsApp Invoices and Payment Reminders',
      excerpt: 'Send credit invoices and payment reminders to customers on WhatsApp after fills.',
      content:
        'This clip shows WhatsApp invoicing for credit customers.\n\nFaster delivery of invoice details helps recovery and keeps customer communication clear.',
      category: 'WhatsApp',
    },
    fa: {
      title: 'فاکتور و یادآوری پرداخت واتساپ',
      excerpt: 'پس از سوخت‌گیری، فاکتور اعتباری و یادآوری پرداخت را در واتساپ برای مشتریان بفرستید.',
      content:
        'این ویدیو صدور فاکتور واتساپ برای مشتریان اعتباری را نشان می‌دهد.\n\nارسال سریع جزئیات فاکتور وصول را آسان و ارتباط با مشتری را شفاف می‌کند.',
      category: 'واتساپ',
    },
    ps: {
      title: 'د WhatsApp رسیدونه او د تادیې یادونې',
      excerpt: 'د تیل ډکولو وروسته اعتباري پیرودونکو ته په WhatsApp رسیدونه او د تادیې یادونې ولېږئ.',
      content:
        'دا کليپ د اعتباري پیرودونکو لپاره د WhatsApp رسیدونه ښيي.\n\nد رسید جزئیاتو چټک لیږل وصول اسانه کوي او د پیرودونکي اړیکه روښانه ساتي.',
      category: 'WhatsApp',
    },
  },
  'multi-station-fuel-network-management': {
    en: {
      title: 'Multi-Station Fuel Network Management',
      excerpt: 'Manage multiple fuel stations from one account with shared visibility on sales and stock.',
      content:
        'This clip covers multi-station management for owners who run more than one site.\n\nCompare performance across locations without switching tools.',
      category: 'Multi-Station',
    },
    fa: {
      title: 'مدیریت شبکه چندپمپی',
      excerpt: 'چند پمپ تیل را از یک حساب با دید مشترک بر فروش و موجودی مدیریت کنید.',
      content:
        'این ویدیو مدیریت چندپمپی را برای مالکانی پوشش می‌دهد که بیش از یک ایستگاه دارند.\n\nعملکرد مکان‌ها را بدون تعویض ابزار مقایسه کنید.',
      category: 'چندپمپی',
    },
    ps: {
      title: 'د څو پمپونو د شبکې مدیریت',
      excerpt: 'له یوه حساب څخه څو سون توکو پمپونه د پلور او موجودي ګډ لید سره مدیریت کړئ.',
      content:
        'دا کليپ د هغو خاوندانو لپاره د څو پمپونو مدیریت پوښي چې له یوه زیات ځای لري.\n\nپرته له دې چې وسیلې بدلې کړئ د ځایونو فعالیت پرتله کړئ.',
      category: 'څو پمپونه',
    },
  },
  'daily-closing-shift-management': {
    en: {
      title: 'Daily Closing and Shift Management',
      excerpt: 'Close shifts with clear sales, cash, credit, and stock checks in one guided flow.',
      content:
        'This clip walks through daily closing and shift management.\n\nA structured close reduces missing figures and end-of-day disputes.',
      category: 'Daily Closing',
    },
    fa: {
      title: 'بستن روزانه و مدیریت شیفت',
      excerpt: 'شیفت را با بررسی واضح فروش، نقد، اعتبار و موجودی در یک جریان هدایت‌شده ببندید.',
      content:
        'این ویدیو بستن روزانه و مدیریت شیفت را قدم‌به‌قدم نشان می‌دهد.\n\nبستن ساختاریافته ارقام گم‌شده و اختلاف پایان روز را کم می‌کند.',
      category: 'بستن روزانه',
    },
    ps: {
      title: 'ورځنی بندښت او د شفټ مدیریت',
      excerpt: 'شفټ د پلور، نغدي، اعتبار او موجودي روښانه چک سره په یوه لارښود بهیر کې بند کړئ.',
      content:
        'دا کليپ ورځنی بندښت او د شفټ مدیریت ښيي.\n\nجوړښتي بندښت ورک شوي ارقام او د ورځې پای اختلافونه کموي.',
      category: 'ورځنی بندښت',
    },
  },
  'credit-customer-vehicle-wise-billing': {
    en: {
      title: 'Credit Customer and Vehicle-Wise Billing',
      excerpt: 'Bill credit customers by vehicle and keep receivable history organized.',
      content:
        'This clip shows credit customer billing with vehicle-wise detail.\n\nStations can track who filled what and what remains unpaid.',
      category: 'Credit Management',
    },
    fa: {
      title: 'صورتحساب اعتباری و بر اساس وسیله',
      excerpt: 'مشتریان اعتباری را بر اساس وسیله صورتحساب کنید و سابقه مطالبات را منظم نگه دارید.',
      content:
        'این ویدیو صورتحساب مشتریان اعتباری با جزئیات وسیله را نشان می‌دهد.\n\nپمپ‌ها می‌توانند ببینند چه کسی چه سوخت گرفته و چه مبلغی پرداخت‌نشده مانده است.',
      category: 'مدیریت اعتبار',
    },
    ps: {
      title: 'اعتباري پیرودونکی او د موټر له مخې بیلینګ',
      excerpt: 'اعتباري پیرودونکي د موټر له مخې بیل کړئ او د پور تاریخچه منظم وساتئ.',
      content:
        'دا کليپ د موټر جزئیاتو سره د اعتباري پیرودونکو بیلینګ ښيي.\n\nپمپونه کولی شي تعقیب کړي چا څه ډک کړي او څومره نه دي تادیه شوي.',
      category: 'د اعتبار مدیریت',
    },
  },
  'tank-dipping-stock-gain-loss-reports': {
    en: {
      title: 'Tank Dipping and Stock Gain/Loss Reports',
      excerpt: 'Compare dips with book stock and review gain/loss clearly after each period.',
      content:
        'This clip explains dipping versus book stock and how gain/loss reports support control.\n\nOwners get a clearer picture of product movement and variance.',
      category: 'Stock Control',
    },
    fa: {
      title: 'اندازه‌گیری تانک و گزارش سود/زیان موجودی',
      excerpt: 'اندازه‌گیری را با موجودی دفتری مقایسه کنید و سود/زیان را پس از هر دوره واضح ببینید.',
      content:
        'این ویدیو مقایسه اندازه‌گیری با موجودی دفتری و نقش گزارش سود/زیان در کنترل را توضیح می‌دهد.\n\nمالکان تصویر واضح‌تری از حرکت محصول و اختلاف می‌گیرند.',
      category: 'کنترل موجودی',
    },
    ps: {
      title: 'د ټانک اندازه‌ګیري او د موجودي ګټې/زیان راپورونه',
      excerpt: 'اندازه‌ګیرۍ د دفتری موجودي سره پرتله کړئ او د هرې دورې وروسته ګټه/زیان روښانه وګورئ.',
      content:
        'دا کليپ د اندازه‌ګیرۍ او دفتری موجودي پرتله او دا چې د ګټې/زیان راپورونه څنګه کنټرول ملاتړ کوي تشریح کوي.\n\nخاوندان د محصول حرکت او توپیر روښانه انځور ترلاسه کوي.',
      category: 'د موجودي کنټرول',
    },
  },
  'cloud-based-petrol-pump-management': {
    en: {
      title: 'Cloud-Based Fuel Station Management',
      excerpt: 'Access Petroleu from anywhere with secure cloud workflows for owners and managers.',
      content:
        'This clip covers cloud-based access so owners can review station activity remotely.\n\nSecure login and role-based access keep operations protected while staying flexible.',
      category: 'Cloud Software',
    },
    fa: {
      title: 'مدیریت ابری پمپ تیل',
      excerpt: 'با گردش‌کار امن ابری از هر جا به Petroleu برای مالکان و مدیران دسترسی داشته باشید.',
      content:
        'این ویدیو دسترسی ابری را پوشش می‌دهد تا مالکان فعالیت پمپ را از راه دور ببینند.\n\nورود امن و دسترسی مبتنی بر نقش عملیات را محافظت و انعطاف‌پذیر نگه می‌دارد.',
      category: 'نرم‌افزار ابری',
    },
    ps: {
      title: 'د کلاوډ پر بنسټ د سون توکو پمپ مدیریت',
      excerpt: 'د خاوندانو او مدیرانو لپاره د خوندي کلاوډ بهیر سره له هرځای څخه Petroleu ته لاسرسی ومومئ.',
      content:
        'دا کليپ د کلاوډ لاسرسی پوښي ترڅو خاوندان د پمپ فعالیت له لرې وګوري.\n\nخوندي ننوتل او د رول پر بنسټ لاسرسی عملیات خوندي او انعطاف‌پذیر ساتي.',
      category: 'کلاوډ سافټویر',
    },
  },
}

function hasAfPost(locale, slug) {
  return blog.some((b) => b.market_code === 'af' && b.locale_code === locale && b.slug === slug)
}

const pkPublished = blog.filter((b) => b.market_code === 'pk' && b.status === 'published')

for (const src of pkPublished) {
  const tr = TR[src.slug]
  if (!tr) {
    changes.push(`skip untranslated slug ${src.slug}`)
    continue
  }
  for (const [locale, pack] of [
    ['en-AF', tr.en],
    ['fa-AF', tr.fa],
    ['ps-AF', tr.ps],
  ]) {
    if (hasAfPost(locale, src.slug)) {
      changes.push(`keep existing blog ${locale}/${src.slug}`)
      continue
    }
    blog.push({
      id: nextBlogId(),
      market_code: 'af',
      locale_code: locale,
      slug: src.slug,
      title: pack.title,
      excerpt: pack.excerpt,
      content: pack.content,
      image_url: src.image_url,
      image_alt: pack.title,
      category: pack.category,
      author: src.author || 'Petroleu',
      media_type: src.media_type || 'video',
      video_url: src.video_url || null,
      status: 'published',
      is_enabled: true,
      show_on_homepage: Boolean(src.show_on_homepage),
      published_at: src.published_at || new Date().toISOString().slice(0, 10),
      seo_title: pack.title,
      seo_description: pack.excerpt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    changes.push(`add blog ${locale}/${src.slug}`)
  }
}

// Fix en-AF placeholder heroes
for (const s of sections) {
  if (s.market_code !== 'af' || s.locale_code !== 'en-AF') continue
  if (typeof s.title === 'string' && s.title.includes('[Translation required]')) {
    const cleaned = s.title.replace(/^\[Translation required\]\s*/i, '').trim()
    const map = {
      Pricing: 'Simple, transparent pricing for fuel stations',
      Blog: 'Resources & guides for fuel stations',
      Faq: 'Frequently asked questions',
      FAQ: 'Frequently asked questions',
    }
    const next = map[cleaned] || cleaned || s.title
    if (next !== s.title) {
      changes.push(`fix en-AF section ${s.id} title`)
      s.title = next
      s.updated_at = new Date().toISOString()
    }
  }
}

// Sync FAQ page items from home FAQs (additive) for each AF locale
for (const locale of ['en-AF', 'fa-AF', 'ps-AF']) {
  const homeFaqs = sections
    .filter(
      (s) =>
        s.market_code === 'af' &&
        s.locale_code === locale &&
        s.page_slug === 'home' &&
        s.section_key === 'faq' &&
        s.status === 'published',
    )
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  const pageFaqs = sections.filter(
    (s) =>
      s.market_code === 'af' &&
      s.locale_code === locale &&
      s.page_slug === 'faq' &&
      s.section_key === 'faq',
  )
  const titles = new Set(pageFaqs.map((s) => String(s.title || '').trim()))
  let sort = Math.max(0, ...pageFaqs.map((s) => Number(s.sort_order) || 0))
  for (const hf of homeFaqs) {
    const title = String(hf.title || '').trim()
    if (!title || titles.has(title)) continue
    sort += 10
    sections.push({
      id: nextSectionId(),
      market_code: 'af',
      locale_code: locale,
      page_slug: 'faq',
      section_key: 'faq',
      title: hf.title,
      description: hf.description || hf.content || null,
      content: hf.content || hf.description || null,
      image_url: null,
      image_alt: null,
      link_label: null,
      link_url: null,
      sort_order: sort,
      status: 'published',
      is_enabled: true,
      is_shared: false,
      translation_status: 'ready',
      data: hf.data || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    titles.add(title)
    changes.push(`add faq-page item ${locale}: ${title.slice(0, 48)}`)
  }
}

fs.writeFileSync(blogFile, JSON.stringify(blog, null, 2) + '\n', 'utf8')
fs.writeFileSync(sectionsFile, JSON.stringify(sections, null, 2) + '\n', 'utf8')
console.log('CHANGES', changes.length)
for (const c of changes) console.log('-', c)
