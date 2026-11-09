
    /*
      SVG
    */

    d3.select("#viewer-title")
      .text(projectConfig.title);

    d3.select("#viewer-description")
      .text(projectConfig.description);

    const svg = d3
      .select("#map")
      .append("svg")
      .attr("viewBox", "0 0 600 800")
      .attr("preserveAspectRatio", "xMidYMid meet");
/*
  Fondo configurable
*/

if (
  projectConfig.mapStyle.background.enabled
) {

  svg
    .style(
      "background",
      projectConfig.mapStyle.background.fill
    );

} else {

  svg.style(
    "background",
    "transparent"
  );

}

    /*
      Capa cartográfica
    */

    const mapLayer = svg
      .append("g")
      .attr("class", "map-layer");


    /*
      Zoom y desplazamiento
    */

    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .translateExtent([
        [-300, -400],
        [900, 1200]
      ])
      .filter(event => {
  /* La rueda mantiene el scroll de la página */
  if (event.type === "wheel") {
    return false;
  }

  /* Ratón: solo botón izquierdo */
  if (event.type === "mousedown") {
    return event.button === 0;
  }

  /* Táctil: el mapa solo responde con dos dedos */
  if (event.type.startsWith("touch")) {
    return event.touches &&
           event.touches.length >= 2;
  }

  return true;
})
      .on("zoom", event => {

        mapLayer.attr(
          "transform",
          event.transform
        );

      });


    svg.call(zoom);
    svg.on("wheel.zoom", null);
    svg.on("dblclick.zoom", null);

    const indicatorSelector =
      d3.select("#indicator");

    Object.entries(
      projectConfig.indicators
    ).forEach(([key, indicator]) => {

      indicatorSelector
        .append("option")
        .attr("value", key)
        .property("disabled", !indicator.enabled)
        .text(indicator.label);

    });

    indicatorSelector.property(
      "value",
      projectConfig.initialIndicator
    );

    /*
  Carga únicamente las capas
  activadas por el proyecto
*/

const mapPromises = {};

Object.entries(
  projectConfig.maps
).forEach(([key, layer]) => {

  if (layer.enabled) {

    mapPromises[key] =
      d3.json(layer.file);

  }

});


Promise.all([

  Promise.all(
    Object.entries(mapPromises)
      .map(async ([key, promise]) => [
        key,
        await promise
      ])
  ),

  d3.csv(
    projectConfig.data
  )

])

.then(([loadedMaps, data]) => {

  /*
    Convertimos las capas cargadas
    en un objeto accesible por nombre.
  */

  const maps =
    Object.fromEntries(loadedMaps);

  const teruel =
    maps.municipalities;

/*
  Datos municipales accesibles
  mediante COD_INE
*/

const dataByMunicipality =
  new Map(
    data.map(d => [
      d.COD_INE,
      d
    ])
  );

  /*
  Lista de municipios para el buscador
*/

const municipalityList =
  d3.select("#municipality-list");

teruel.features
  .slice()
  .sort((a, b) =>
    a.properties.NOMBRE.localeCompare(
      b.properties.NOMBRE,
      "es"
    )
  )
  .forEach(feature => {

    municipalityList
      .append("option")
      .attr(
        "value",
        feature.properties.NOMBRE
      );

  });

      /*
        Indicador inicial
      */

      let currentIndicator = projectConfig.initialIndicator;
      let selectedMunicipality = null;
      let viewBeforeSearch = null;
      let searchIsActive = false;

      /*
        Escala provisional.
        Todos los datos de prueba están
        entre 0 y 100.
      */


      /*
        Actualiza los colores del mapa
        según el indicador seleccionado.
      */

function getScaleDomain(scale, numericValues) {

  let min;
  let max;

  if (Array.isArray(scale.domain)) {
    [min, max] = scale.domain;
  } else {
    min = d3.min(numericValues);
    max = d3.max(numericValues);
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [0, 0];
  }

  const rounding = scale.rounding;

  if (Number.isFinite(rounding) && rounding > 0) {
    min = Math.floor(min / rounding) * rounding;
    max = Math.ceil(max / rounding) * rounding;
  }

  return [min, max];

}

function updateMap() {

  const config =
    projectConfig.indicators[currentIndicator];

  const values = new Map(

  data.map(d => [
    d.COD_INE,
    +d[config.field]
  ])

);

  const numericValues =
    Array.from(values.values())
      .filter(Number.isFinite);


  const domain =
    getScaleDomain(config.scale, numericValues);


  /*
    Construimos los cinco tonos
    a partir del color definido
    para el indicador.
  */

  const baseColor =
    d3.color(config.color);

  const tones =
    config.scale.intensities.map(
      intensity =>
        d3.interpolateRgb(
          "#ffffff",
          baseColor
        )(intensity)
    );


/*
  Escala de color
*/

let colorScale;


if (config.scale.mode === "steps") {

  if (Array.isArray(config.scale.breaks)) {
    colorScale =
      d3.scaleThreshold()
        .domain(config.scale.breaks.map(limit => limit + 1))
        .range(tones);
  } else {
    colorScale =
      d3.scaleQuantize()
        .domain(domain)
        .range(tones);
  }

} else if (
  config.scale.mode === "continuous"
) {

  /*
    Gradación continua
  */

  const minIntensity =
    config.scale.intensities[0];

  const maxIntensity =
    config.scale.intensities[
      config.scale.intensities.length - 1
    ];

  const lightColor =
    d3.interpolateRgb(
      "#ffffff",
      baseColor
    )(minIntensity);

  const darkColor =
    d3.interpolateRgb(
      "#ffffff",
      baseColor
    )(maxIntensity);


  colorScale =
    d3.scaleSequential()
      .domain(domain)
      .interpolator(
        d3.interpolateRgb(
          lightColor,
          darkColor
        )
      );

}

  /*
    Pintamos los municipios
  */

  mapLayer
    .selectAll(".municipality")
    .attr("fill", d => {

      const value =
        values.get(
          d.properties.COD_INE
        );

      return Number.isFinite(value)
  ? colorScale(value)
  : projectConfig.mapStyle.municipalities.noDataFill;

    });

}
function updateLegend() {

  const config =
    projectConfig.indicators[currentIndicator];

  const numericValues =
  data
    .map(d => +d[config.field])
    .filter(Number.isFinite);


  const [min, max] =
    getScaleDomain(config.scale, numericValues);


  /*
    Color base
  */

  const baseColor =
    d3.color(config.color);

  const minIntensity =
    config.scale.intensities[0];

  const maxIntensity =
    config.scale.intensities[
      config.scale.intensities.length - 1
    ];


  const lightColor =
    d3.interpolateRgb(
      "#ffffff",
      baseColor
    )(minIntensity);

  const darkColor =
    d3.interpolateRgb(
      "#ffffff",
      baseColor
    )(maxIntensity);


  /*
    Contenedor
  */

  const legend =
    d3.select("#legend");

  legend.html("");


  /*
    Unidad
  */

  legend
    .append("div")
    .attr("class", "legend-title")
    .text(config.unit);


  /*
    MODO: CINCO ESCALONES
  */

  if (config.scale.mode === "steps") {

    const tones =
      config.scale.intensities.map(
        intensity =>
          d3.interpolateRgb(
            "#ffffff",
            baseColor
          )(intensity)
      );

    if (Array.isArray(config.scale.breaks)) {

      const formatValue = value =>
        String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      const bar =
        legend
          .append("div")
          .attr("class", "legend-threshold-bar");

      tones.forEach(tone => {
        bar
          .append("span")
          .style("background", tone);
      });

      const values =
        legend
          .append("div")
          .attr("class", "legend-threshold-values");

      config.scale.breaks.forEach((limit, index) => {
        values
          .append("span")
          .style("left", `${((index + 1) / tones.length) * 100}%`)
          .text(formatValue(limit));
      });

    } else {

      const bar =
        legend
          .append("div")
          .attr("class", "legend-steps")
          .style("display", "flex");


      tones.forEach(tone => {

        bar
          .append("div")
          .style("flex", "1")
          .style("height", "10px")
          .style("background", tone);

      });


      /*
        Límites de los cinco intervalos
      */

      const step =
        (max - min) /
        config.scale.classes;

      const limits =
        d3.range(
          config.scale.classes + 1
        ).map(
          i => min + step * i
        );


      const values =
        legend
          .append("div")
          .attr("class", "legend-values");


      limits.forEach(value => {

        values
          .append("span")
          .text(
            Number.isInteger(value)
              ? value
              : value.toFixed(1)
          );

      });

    }

  }


  /*
    MODO: CONTINUO
  */

  else if (
    config.scale.mode === "continuous"
  ) {

    legend
      .append("div")
      .attr("class", "legend-continuous")
      .style("height", "10px")
      .style(
        "background",
        `linear-gradient(
          to right,
          ${lightColor},
          ${darkColor}
        )`
      );


    const values =
      legend
        .append("div")
        .attr("class", "legend-values");


    values
      .append("span")
      .text(min);


    values
      .append("span")
      .text(max);

  }

}

/**
 * Proyección específica
 * del proyecto Teruel.
 */

const viewportWidth = window.innerWidth;

let top;
let bottom;
let left;
let right;

if (viewportWidth < 450) {

  // Móvil: encuadre actual
  left = 55;
  right = 545;
  top = 300;
  bottom = 750;

} else if (viewportWidth < 700) {

  // Transición para tablet / ventanas intermedias
  const width = Math.min(viewportWidth, 700);
  const progress = (width - 450) / (700 - 450);

  left = 55;
  right = 545;
  top = 300 - (progress * 110);
  bottom = 750 - (progress * 110);

} else {

  // Laptop: composición cuadrada
  left = 20;
  right = 580;
  top = 210;
  bottom = 790;

}

const projection = d3
  .geoMercator()
  .fitExtent(
    [
      [left, top],
      [right, bottom]
    ],
    teruel
  );

if (viewportWidth < 530) {

  const translate = projection.translate();

  projection.translate([
    translate[0] - 30,
    translate[1]
  ]);

}

const path = d3.geoPath(projection);

/*
  Lleva el mapa hasta un municipio
*/

function zoomToMunicipality(feature) {

  const centroid =
    path.centroid(feature);

  const x = centroid[0];
  const y = centroid[1];

  const scale = 4;

  const transform =
    d3.zoomIdentity
      .translate(
        projectConfig.view.width / 2,
        projectConfig.view.height / 2
      )
      .scale(scale)
      .translate(-x, -y);

  svg
    .transition()
    .duration(600)
    .call(
      zoom.transform,
      transform
    );
}

/*
  Capas cartográficas de contexto
*/
function updateDetailPanel(feature) {

  const code =
    feature.properties.COD_INE;

  const name =
    feature.properties.NOMBRE;

  const municipalityData =
    dataByMunicipality.get(code);

  const panel =
    d3.select("#detail-panel");

  panel.html("");

  panel
    .classed("visible", true);

  panel
    .append("div")
    .attr("class", "detail-name")
    .text(name);

  /*
    Municipio sin datos
  */

  if (!municipalityData) {

    panel
      .append("div")
      .attr("class", "detail-indicator")
      .text("Sin datos disponibles");

    return;
  }


  /*
    Indicador seleccionado
  */

  const config =
    projectConfig.indicators[currentIndicator];

  const value =
  municipalityData[config.field];

  panel
    .append("div")
    .attr("class", "detail-indicator")
    .text(config.label);

  panel
    .append("div")
    .attr("class", "detail-value")
    .text(`${value} ${config.unit}`);
}

/*
  Selecciona un municipio
*/

function selectMunicipality(feature) {

  selectedMunicipality = feature;

  /*
    Eliminamos el resalte anterior
  */
  selectionLayer
    .selectAll("*")
    .remove();

  /*
    Dibujamos el municipio seleccionado
    por encima de todos los demás
  */
  selectionLayer
    .append("path")
    .datum(feature)
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 1.90)
    .attr(
      "vector-effect",
      "non-scaling-stroke"
    );

  updateDetailPanel(feature);
}

const contextLayers = [
  "autonomousCommunities",
  "provinces"
];


contextLayers.forEach(layerName => {

  const geography =
    maps[layerName];

  const style =
    projectConfig.mapStyle[layerName];


  /*
    Si esta capa no está cargada,
    continuamos con la siguiente.
  */

  if (!geography) {
    return;
  }


  mapLayer
    .append("g")
    .attr(
      "class",
      `${layerName}-layer`
    )
    .selectAll("path")
    .data(geography.features)
    .join("path")
    .attr(
      "class",
      "context-feature"
    )
    .attr(
      "d",
      path
    )
    .attr(
      "fill",
      style.fill
    )
    .attr(
      "stroke",
      style.stroke
    )
    .attr(
      "stroke-width",
      style.strokeWidth
    )
    .attr(
      "vector-effect",
      "non-scaling-stroke"
    );

});


      /*
        Municipios de Teruel
      */

      mapLayer
        .append("g")
        .attr(
          "class",
          "teruel-layer"
        )
        .selectAll("path")
        .data(teruel.features)
        .join("path")
.attr(
  "class",
  "municipality"
)
.attr(
  "d",
  path
)

.on("click", function(event, d) {

  /*
    Si venimos de una búsqueda,
    recuperamos la vista anterior.
  */
  if (searchIsActive) {

    d3
      .select("#municipality-search")
      .property("value", "");

    searchIsActive = false;

    if (viewBeforeSearch) {
      svg
        .transition()
        .duration(500)
        .call(
          zoom.transform,
          viewBeforeSearch
        );
    }

    viewBeforeSearch = null;
  }

    selectMunicipality(d);
})
.attr(
  "stroke",
  projectConfig.mapStyle.municipalities.stroke
)
.attr(
  "stroke-width",
  projectConfig.mapStyle.municipalities.strokeWidth
);

/*
  Capa superior para resaltar
  el municipio seleccionado
*/
const selectionLayer = mapLayer
  .append("g")
  .attr("class", "selection-layer")
  .style("pointer-events", "none");

  window.resetViewerSelection = function() {

  selectedMunicipality = null;

  selectionLayer
    .selectAll("*")
    .remove();

  d3.select("#detail-panel")
    .classed("visible", false)
    .html("");

  d3.select("#municipality-search")
    .property("value", "");

  searchIsActive = false;
  viewBeforeSearch = null;

};

      /*
        Pintamos el indicador inicial
      */

      updateMap();
      updateLegend();

/**
 * Búsqueda de municipio
 */
d3
  .select("#municipality-search")
  .on("input", function() {

    const searchName =
      this.value.trim();

    const feature =
      teruel.features.find(
        d =>
          d.properties.NOMBRE === searchName
      );

    if (feature) {

      /*
        Guardamos la vista manual solamente
        al iniciar una búsqueda.
      */
      if (!searchIsActive) {
        viewBeforeSearch =
          d3.zoomTransform(svg.node());

        searchIsActive = true;
      }

      selectMunicipality(feature);
      zoomToMunicipality(feature);
    }

  });
  
      /*
        Cambio de indicador
      */

      d3
        .select("#indicator")
        .on(
          "change",
          function() {

            currentIndicator =
             this.value;

            updateMap();
updateLegend();

if (selectedMunicipality) {
  updateDetailPanel(selectedMunicipality);
}

          }
        );

    })

    .catch(error => {

      console.error(
        "Error cargando la cartografía o los datos:",
        error
      );

    });


    /*
      Controles de navegación
    */

    const buttons =
      document.querySelectorAll(
        ".controls button"
      );

    const minusButton =
      buttons[0];

    const plusButton =
      buttons[1];

    const homeButton =
      buttons[2];


    /*
      Zoom -
    */

    minusButton.addEventListener(
      "click",
      () => {

        svg
          .transition()
          .duration(300)
          .call(
            zoom.scaleBy,
            1 / 1.5
          );

      }
    );

/*
  Lleva el mapa hasta un municipio
*/


    /*
      Zoom +
    */

    plusButton.addEventListener(
      "click",
      () => {

        svg
          .transition()
          .duration(300)
          .call(
            zoom.scaleBy,
            1.5
          );

      }
    );


    /*
      Volver a vista inicial
    */

    homeButton.addEventListener(
  "click",
  () => {

    svg
      .transition()
      .duration(500)
      .call(
        zoom.transform,
        d3.zoomIdentity
      );

    window.resetViewerSelection();

  }
);