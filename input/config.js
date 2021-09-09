const { backgrounds } = require("../data/background");
const { bodyMale } = require("../data/body-male");
const fs = require("fs");

const layers = [];
const dir = __dirname;
const width = 1000,
  height = 1000;

// Example
const male = bodyMale[0].gender.male;

// Background Loop
for (const [key, background] of backgrounds.entries()) {
  // Background Variants Loop
  for (const variants in backgrounds[key]) {
    layers.push({
      id: parseInt(key) + 1,
      backgroundName: variants,
      backgroundLocation: `${dir}/background`,
      backgroundPosition: { x: 0, y: 0 },
      backgroundSize: { width, height },
      backgroundVariants: [],
    });
  }
}

// Layers Loop 1
for (const [index, layer] of layers.entries()) {
  for (const background of backgrounds) {
    if (background[layer.backgroundName]) {
      for (const [key, variant] of background[layer.backgroundName].entries()) {
        layer.backgroundVariants.push({
          variantId: parseInt(key) + 1,
          variantName: variant,
          parent: layer.backgroundName,
          bodies: [],
        });
      }
    }
  }
}

// Layers Loop 2
for (const [key, layer] of layers.entries()) {
  for (const [index, variant] of layer.backgroundVariants.entries()) {
    if (variant.variantName in male[0]) {
      for (const [no, body] of male[0][variant.variantName].entries()) {
        variant.bodies.push({
          bodyId: parseInt(no) + 1,
          bodyName: body,
          location: `${dir}/body/male`,
          position: { x: 0, y: 0 },
          size: { width, height },
        });
      }
    }
  }
}

const splitBackgroundName = (str) => {
  const arrString = str.split(" ");
  return {
    variantName: arrString[0].toLowerCase(),
    backgroundName: arrString[1].toLowerCase(),
  };
};

const splitBodyName = (str) => {
  const arrString = str.split(" ");
  return {
    variantName: arrString[0].toLowerCase(),
    bodyName: arrString[1].toLowerCase(),
  };
};

const getImageElement = (path, variant, background = "", bodyName = "") => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      if (background) {
        const cleanString = splitBackgroundName(i);
        if (
          variant === cleanString.variantName &&
          background === cleanString.backgroundName
        ) {
          return {
            // id: index + 1,
            fileName: i,
          };
        }
      } else if (bodyName) {
        const cleanString = splitBodyName(i);
        if (
          variant === cleanString.variantName &&
          bodyName === cleanString.bodyName
        ) {
          return {
            fileName: i,
          };
        }
      }
    })
    .filter(Boolean);
};

for (const layer of layers) {
  for (const backgroundVariant of layer.backgroundVariants) {
    backgroundVariant.element = getImageElement(
      layer.backgroundLocation,
      backgroundVariant.variantName,
      backgroundVariant.parent
    )[0];

    for (const body of backgroundVariant.bodies) {
      body.element = getImageElement(
        body.location,
        backgroundVariant.variantName,
        "",
        body.bodyName
      );
    }
  }
}

module.exports = {
  layers,
  width,
  height,
};
