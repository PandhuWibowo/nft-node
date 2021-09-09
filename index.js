const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const { layers, width, height } = require("./input/config");
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");
const nodeArgs = process.argv.slice(2);
const edition = nodeArgs.length ? Number(nodeArgs[0]) : 1;
let metadata = [];
let hash = [];
let attributes = [];
let decodedHash = [];

const addMetadata = (_edition) => {
  const currentDate = Date.now();
  const tempMetadata = {
    hash: "",
    decodedHash: [],
    edition: _edition,
    date: currentDate,
    attributes,
  };

  metadata.push(tempMetadata);
  attributes = [];
};

const addAttribute = (param) => {
  const tempAttribute = {
    id: param.id,
    layer: param.layer,
    class: param.class,
    name: param.name,
  };

  attributes.push(tempAttribute);
};

const saveLayer = (_canvas, _edition) => {
  try {
    return fs.writeFileSync(
      `./output/${_edition}.png`,
      _canvas.toBuffer("image/png")
    );
  } catch (error) {
    console.error("save layer", error);
    return Promise.reject(error);
  }
};

const drawLayer = async (layerVariant, _edition) => {
  try {
    console.log(layerVariant)
    const backgroundVariant =
      layerVariant.backgroundVariants[
        Math.floor(Math.random() * layerVariant.backgroundVariants.length)
      ];

    if (backgroundVariant) {
      let image = await loadImage(
        `${layerVariant.backgroundLocation}/${backgroundVariant.element.fileName}`
      );
      ctx.drawImage(image, 0, 0, 1000, 1000);

      let el =
        backgroundVariant.bodies[
          Math.floor(Math.random() * backgroundVariant.bodies.length)
        ];

      if (el) {
        addAttribute({
          id: `${layerVariant.id}${backgroundVariant.variantId}`,
          layer: "background",
          class: backgroundVariant.variantName,
          name: layerVariant.backgroundName,
        });
        addAttribute({
          id: el.bodyId,
          layer: "body-male",
          class: backgroundVariant.variantName,
          name: el.bodyName,
        });

        image = await loadImage(`${el.location}/${el.element[0].fileName}`);

        ctx.drawImage(image, 0, 0, 1000, 1000);
        saveLayer(canvas, _edition);
      }
    }
  } catch (error) {
    console.error("draw layer", error);
    return Promise.reject(error);
  }
};

const filterBackground = () => {
  let newLayers = [];
  // Remove undefined value in background element
  for (const layer of layers) {
    layer.backgroundVariants.map((variant, key) => {
      if (variant.element === undefined) delete layer.backgroundVariants[key];

      variant.bodies = variant.bodies.filter((body) => body.element.length);
    });
    layer.backgroundVariants = layer.backgroundVariants.filter(Boolean);
  }
  return (newLayers = [...layers]);
};

const runBackground = async () => {
  let newLayers = filterBackground();

  for (let i = 1; i <= edition; i++) {
    const randomLayer = newLayers[Math.floor(Math.random() * newLayers.length)]
    await drawLayer(randomLayer, i);

    addMetadata(i);

    console.log("Creating edition", i);
  }

  fs.readFile("./output/metadata.json", (err, data) => {
    if (err) throw err;

    fs.writeFileSync("./output/metadata.json", JSON.stringify(metadata));
  });

  console.log("Data successfully generated")
};

runBackground();
