const wineRegions = [
  {
    country: "France",
    regions: [
      {
        region: "Bordeaux",
        appellations: [
          "Médoc",
          "Margaux",
          "Saint-Julien",
          "Pauillac",
          "Saint-Estèphe",
          "Pessac-Léognan",
          "Graves",
          "Saint-Émilion",
          "Pomerol",
          "Sauternes",
          "Barsac",
          "Entre-Deux-Mers",
        ],
      },
      {
        region: "Burgundy",
        appellations: [
          "Chablis",
          "Côte de Nuits",
          "Gevrey-Chambertin",
          "Vosne-Romanée",
          "Nuits-Saint-Georges",
          "Côte de Beaune",
          "Meursault",
          "Puligny-Montrachet",
          "Pommard",
          "Volnay",
          "Mâconnais",
          "Beaujolais",
        ],
      },
      {
        region: "Champagne",
        appellations: [
          "Montagne de Reims",
          "Vallée de la Marne",
          "Côte des Blancs",
          "Côte des Bar",
        ],
      },
      {
        region: "Rhône Valley",
        appellations: [
          "Côte-Rôtie",
          "Condrieu",
          "Hermitage",
          "Crozes-Hermitage",
          "Saint-Joseph",
          "Cornas",
          "Châteauneuf-du-Pape",
          "Gigondas",
          "Vacqueyras",
          "Côtes du Rhône",
        ],
      },
      {
        region: "Loire Valley",
        appellations: [
          "Sancerre",
          "Pouilly-Fumé",
          "Vouvray",
          "Chinon",
          "Bourgueil",
          "Muscadet",
          "Savennières",
          "Saumur-Champigny",
        ],
      },
      {
        region: "Alsace",
        appellations: ["Alsace Grand Cru", "Crémant d'Alsace"],
      },
      {
        region: "Provence",
        appellations: ["Côtes de Provence", "Bandol", "Cassis", "Bellet"],
      },
      {
        region: "Languedoc-Roussillon",
        appellations: [
          "Corbières",
          "Minervois",
          "Faugères",
          "Fitou",
          "Banyuls",
          "Picpoul de Pinet",
        ],
      },
      {
        region: "Jura",
        appellations: ["Arbois", "Château-Chalon", "L'Étoile", "Côtes du Jura"],
      },
      { region: "Savoie", appellations: ["Apremont", "Abymes", "Chignin"] },
      {
        region: "Southwest France",
        appellations: ["Cahors", "Madiran", "Jurançon", "Bergerac"],
      },
    ],
  },
  {
    country: "Italy",
    regions: [
      {
        region: "Piedmont",
        appellations: [
          "Barolo",
          "Barbaresco",
          "Barbera d'Alba",
          "Barbera d'Asti",
          "Dolcetto d'Alba",
          "Gavi",
          "Roero",
          "Asti",
        ],
      },
      {
        region: "Tuscany",
        appellations: [
          "Chianti",
          "Chianti Classico",
          "Brunello di Montalcino",
          "Vino Nobile di Montepulciano",
          "Bolgheri",
          "Maremma",
        ],
      },
      {
        region: "Veneto",
        appellations: [
          "Valpolicella",
          "Amarone della Valpolicella",
          "Soave",
          "Bardolino",
          "Prosecco (Conegliano Valdobbiadene)",
        ],
      },
      {
        region: "Friuli-Venezia Giulia",
        appellations: ["Collio", "Colli Orientali del Friuli", "Friuli Isonzo"],
      },
      { region: "Umbria", appellations: ["Montefalco Sagrantino", "Orvieto"] },
      {
        region: "Abruzzo",
        appellations: ["Montepulciano d'Abruzzo", "Trebbiano d'Abruzzo"],
      },
      {
        region: "Campania",
        appellations: ["Taurasi", "Fiano di Avellino", "Greco di Tufo"],
      },
      {
        region: "Puglia",
        appellations: [
          "Primitivo di Manduria",
          "Salice Salentino",
          "Castel del Monte",
        ],
      },
      {
        region: "Sicily",
        appellations: ["Etna", "Cerasuolo di Vittoria", "Marsala"],
      },
      {
        region: "Lombardy",
        appellations: ["Franciacorta", "Valtellina", "Oltrepò Pavese"],
      },
      {
        region: "Emilia-Romagna",
        appellations: ["Lambrusco di Sorbara", "Lambrusco Grasparossa"],
      },
      {
        region: "Sardinia",
        appellations: ["Vermentino di Gallura", "Cannonau di Sardegna"],
      },
    ],
  },
  {
    country: "Spain",
    regions: [
      {
        region: "Rioja",
        appellations: ["Rioja Alta", "Rioja Alavesa", "Rioja Oriental"],
      },
      { region: "Ribera del Duero", appellations: ["Ribera del Duero DO"] },
      {
        region: "Catalonia",
        appellations: ["Priorat", "Penedès", "Montsant", "Cava"],
      },
      {
        region: "Galicia",
        appellations: ["Rías Baixas", "Ribeira Sacra", "Valdeorras", "Bierzo"],
      },
      {
        region: "Andalusia",
        appellations: ["Jerez-Xérès-Sherry", "Montilla-Moriles", "Málaga"],
      },
      { region: "Castilla y León", appellations: ["Rueda", "Toro", "Cigales"] },
      {
        region: "Castilla-La Mancha",
        appellations: ["La Mancha", "Valdepeñas"],
      },
      {
        region: "Levante",
        appellations: ["Jumilla", "Yecla", "Alicante", "Utiel-Requena"],
      },
      { region: "Navarra", appellations: ["Navarra DO"] },
      {
        region: "Basque Country",
        appellations: ["Txakolí (Getariako Txakolina)"],
      },
    ],
  },
  {
    country: "Portugal",
    regions: [
      { region: "Douro", appellations: ["Douro DOC", "Porto (Port)"] },
      { region: "Vinho Verde", appellations: ["Vinho Verde DOC"] },
      { region: "Dão", appellations: ["Dão DOC"] },
      { region: "Bairrada", appellations: ["Bairrada DOC"] },
      { region: "Alentejo", appellations: ["Alentejo DOC"] },
      { region: "Setúbal Peninsula", appellations: ["Setúbal DOC", "Palmela"] },
      { region: "Madeira", appellations: ["Madeira DOC"] },
    ],
  },
  {
    country: "Germany",
    regions: [
      { region: "Mosel", appellations: ["Mosel DO"] },
      { region: "Rheingau", appellations: ["Rheingau DO"] },
      { region: "Rheinhessen", appellations: ["Rheinhessen DO"] },
      { region: "Pfalz", appellations: ["Pfalz DO"] },
      { region: "Nahe", appellations: ["Nahe DO"] },
      { region: "Baden", appellations: ["Baden DO"] },
      { region: "Franken", appellations: ["Franken DO"] },
    ],
  },
  {
    country: "Austria",
    regions: [
      { region: "Wachau", appellations: ["Wachau DAC"] },
      { region: "Kamptal", appellations: ["Kamptal DAC"] },
      { region: "Kremstal", appellations: ["Kremstal DAC"] },
      {
        region: "Burgenland",
        appellations: [
          "Neusiedlersee DAC",
          "Mittelburgenland DAC",
          "Leithaberg DAC",
        ],
      },
      { region: "Weinviertel", appellations: ["Weinviertel DAC"] },
      { region: "Styria", appellations: ["Südsteiermark DAC"] },
    ],
  },
  {
    country: "Greece",
    regions: [
      { region: "Santorini", appellations: ["Santorini PDO"] },
      { region: "Macedonia", appellations: ["Naoussa PDO", "Amyndeon PDO"] },
      { region: "Peloponnese", appellations: ["Nemea PDO", "Mantinia PDO"] },
      { region: "Crete", appellations: ["Peza PDO"] },
    ],
  },
  {
    country: "Hungary",
    regions: [
      { region: "Tokaj", appellations: ["Tokaji PDO"] },
      { region: "Eger", appellations: ["Eger PDO (Egri Bikavér)"] },
      { region: "Villány", appellations: ["Villány PDO"] },
    ],
  },
  {
    country: "Georgia",
    regions: [
      { region: "Kakheti", appellations: ["Kakheti PDO"] },
      { region: "Kartli", appellations: ["Kartli PDO"] },
      { region: "Imereti", appellations: ["Imereti PDO"] },
    ],
  },
  {
    country: "Romania",
    regions: [
      { region: "Dealu Mare", appellations: ["Dealu Mare DOC"] },
      { region: "Moldavia", appellations: ["Cotnari DOC"] },
    ],
  },
  {
    country: "Croatia",
    regions: [
      { region: "Istria", appellations: ["Istria PDO"] },
      { region: "Dalmatia", appellations: ["Pelješac", "Hvar"] },
    ],
  },
  {
    country: "United States",
    regions: [
      {
        region: "California",
        appellations: [
          "Napa Valley AVA",
          "Sonoma County AVA",
          "Russian River Valley AVA",
          "Paso Robles AVA",
          "Santa Barbara County AVA",
          "Central Coast AVA",
        ],
      },
      {
        region: "Oregon",
        appellations: ["Willamette Valley AVA", "Dundee Hills AVA"],
      },
      {
        region: "Washington State",
        appellations: ["Columbia Valley AVA", "Walla Walla Valley AVA"],
      },
      {
        region: "New York",
        appellations: ["Finger Lakes AVA", "Long Island AVA"],
      },
    ],
  },
  {
    country: "Chile",
    regions: [
      {
        region: "Central Valley",
        appellations: [
          "Maipo Valley",
          "Rapel Valley",
          "Colchagua Valley",
          "Curicó Valley",
        ],
      },
      {
        region: "Aconcagua",
        appellations: [
          "Aconcagua Valley",
          "Casablanca Valley",
          "San Antonio Valley",
        ],
      },
      {
        region: "Southern Regions",
        appellations: ["Maule Valley", "Itata Valley", "Bío Bío Valley"],
      },
    ],
  },
  {
    country: "Argentina",
    regions: [
      {
        region: "Mendoza",
        appellations: ["Luján de Cuyo", "Uco Valley", "Maipú"],
      },
      { region: "Salta", appellations: ["Cafayate"] },
      { region: "Patagonia", appellations: ["Río Negro"] },
    ],
  },
  {
    country: "Australia",
    regions: [
      {
        region: "South Australia",
        appellations: [
          "Barossa Valley",
          "Eden Valley",
          "McLaren Vale",
          "Clare Valley",
          "Coonawarra",
          "Adelaide Hills",
        ],
      },
      {
        region: "Victoria",
        appellations: ["Yarra Valley", "Mornington Peninsula", "Rutherglen"],
      },
      { region: "New South Wales", appellations: ["Hunter Valley", "Mudgee"] },
      {
        region: "Western Australia",
        appellations: ["Margaret River", "Great Southern"],
      },
      { region: "Tasmania", appellations: ["Tasmania GI"] },
    ],
  },
  {
    country: "New Zealand",
    regions: [
      { region: "Marlborough", appellations: ["Marlborough GI"] },
      { region: "Central Otago", appellations: ["Central Otago GI"] },
      { region: "Hawke's Bay", appellations: ["Hawke's Bay GI"] },
      { region: "Martinborough", appellations: ["Martinborough GI"] },
    ],
  },
  {
    country: "South Africa",
    regions: [
      {
        region: "Western Cape",
        appellations: [
          "Stellenbosch",
          "Paarl",
          "Swartland",
          "Constantia",
          "Walker Bay",
        ],
      },
    ],
  },
  {
    country: "Uruguay",
    regions: [
      { region: "Canelones", appellations: ["Canelones DO"] },
      { region: "Maldonado", appellations: ["Maldonado DO"] },
    ],
  },
];

module.exports = wineRegions;
