import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { exportSizeConfig, uiSizeConfig, uiSizeProps } from "../src/sizing";
import { generatePalette, normalize } from "../src/palette";

describe("default control size", () => {
  it("migrates old themes and preserves valid choices through save/restore", () => {
    for (const value of [undefined, null, "xl", {}, "__proto__"]) {
      assert.equal(normalize({ uiSize: value }).uiSize, "md");
    }
    for (const size of ["sm", "md", "lg"] as const) {
      const palette = generatePalette({ uiSize: size });
      assert.equal(generatePalette(JSON.parse(JSON.stringify(palette.values))).values.uiSize, size);
      assert.deepEqual(palette.theme.scales, generatePalette({ uiSize: "md" }).theme.scales);
    }
  });
  it("exports the same native defaults used in the live preview", () => {
    for (const size of ["sm", "md", "lg"] as const) {
      const props = uiSizeProps(size);
      const config = uiSizeConfig(size);
      for (const component of Object.keys(props) as (keyof typeof props)[]) {
        assert.equal(config[component].defaultVariants.size, props[component].size);
      }
      assert.ok(!("alert" in props));
      assert.ok(!("table" in props));
      assert.ok(exportSizeConfig(size).includes(`button: { defaultVariants: { size: '${size}' } }`));
      assert.ok(exportSizeConfig(size, "vue").includes(JSON.stringify(size)));
    }
  });
});
