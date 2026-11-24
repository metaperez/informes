const projectConfig = {

  id: "teruel",

  title: "Expansión de la trufa en Teruel",

  description: "Superficie cultivada por municipios, 1999–2025",

  legendTitle: "Hectáreas cultivadas",

maps: {

  autonomousCommunities: {
    enabled: false,
    file: "maps/espana-ccaa.geojson"
  },

  provinces: {
    enabled: true,
    file: "maps/espana-provincias.geojson"
  },

  municipalities: {
    enabled: true,
    file: "maps/teruel-municipios.geojson"
  }

},

mapStyle: {

  background: {
    enabled: true,
    fill: "#f7f7f7"
  },

  autonomousCommunities: {
    fill: "none",
    stroke: "#999999",
    strokeWidth: 1.5
  },

  provinces: {
    fill: "#e5e5e5",
    stroke: "#ffffff",
    strokeWidth: 1
  },

  municipalities: {
    noDataFill: "#FFFFFF",
    stroke: "#ffffff",
    strokeWidth: 0.45
  }

},

  data: "data/hidrotuber_teruel.csv",

  initialIndicator: "acum_4",

  indicators: {

    ha_e0: {
      field: "ha_e0",
      label: "Antes de 1999",
      unit: "ha",
      color: "#0066A4",
      enabled: true,

      scale: {
        mode: "steps",
        breaks: [5, 20, 75, 250],
        intensities: [0.15, 0.30, 0.60, 0.80, 1]
      }
    },

    acum_1: {
      field: "acum_1",
      label: "1999",
      unit: "ha",
      color: "#0066A4",
      enabled: true,

      scale: {
        mode: "steps",
        breaks: [5, 20, 75, 250],
        intensities: [0.15, 0.30, 0.60, 0.80, 1]
      }
    },

    acum_2: {
      field: "acum_2",
      label: "2009",
      unit: "ha",
      color: "#0066A4",
      enabled: true,

      scale: {
        mode: "steps",
        breaks: [5, 20, 75, 250],
        intensities: [0.15, 0.30, 0.60, 0.80, 1]
      }
    },

    acum_3: {
      field: "acum_3",
      label: "2018",
      unit: "ha",
      color: "#0066A4",
      enabled: true,

      scale: {
        mode: "steps",
        breaks: [5, 20, 75, 250],
        intensities: [0.15, 0.30, 0.60, 0.80, 1]
      }
    },

    acum_4: {
      field: "acum_4",
      label: "2025",
      unit: "ha",
      color: "#0066A4",
      enabled: true,

      scale: {
        mode: "steps",
        breaks: [5, 20, 75, 250],
        intensities: [0.15, 0.30, 0.60, 0.80, 1]
      }
    }
  },

  view: {
    width: 600,
    height: 800,

    fitExtent: [
      [55, 300],
      [545, 750]
    ],

    minZoom: 1,
    maxZoom: 8
  }

};