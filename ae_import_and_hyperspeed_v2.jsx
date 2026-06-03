{
    // Author: dglxss
    // Version: 2.0
    // Updates: seed control, ghost opacity, field flow blend, per-layer phase offset

    function createGlitchComp() {
        var proj = app.project;
        if (!proj) return;

        app.beginUndoGroup("Import and Hyperspeed v2");

        // 1. SELECT FOLDER
        var targetFolder = Folder.selectDialog("Select the folder containing your PLATEN outputs");
        if (!targetFolder) return;

        // 2. GET FILES
        var files = targetFolder.getFiles(function (f) {
            return f instanceof File && (f.name.match(/\.(jpg|jpeg|png|tif|tiff|psd|ai)$/i));
        });

        if (files.length === 0) {
            alert("No valid images found in selected folder.");
            return;
        }

        files.sort();

        // 3. CREATE IMPORT FOLDER IN PROJECT
        var importBin = proj.items.addFolder("Imported_Hyperspeed_Layers");

        // 4. IMPORT IMAGES
        var importedLayers = [];
        for (var i = 0; i < files.length; i++) {
            try {
                var io = new ImportOptions(files[i]);
                if (io.canImportAs(ImportAsType.FOOTAGE)) {
                    var item = proj.importFile(io);
                    item.parentFolder = importBin;
                    importedLayers.push(item);
                }
            } catch (e) {
                // Skip problematic files
            }
        }

        if (importedLayers.length === 0) return;

        // 5. CREATE COMPOSITION
        var firstItem = importedLayers[0];
        var compWidth  = firstItem.width;
        var compHeight = firstItem.height;
        var compDuration = 10;
        var compRate     = 24;

        var comp = proj.items.addComp(
            "Hyperspeed_Composite",
            compWidth, compHeight, 1, compDuration, compRate
        );
        comp.openInViewer();

        // 6. CREATE MASTER CONTROLLER
        var controller = comp.layers.addNull();
        controller.name = "CONTROLLER";
        controller.source.name = "CONTROLLER";
        controller.guideLayer = true;

        // --- Original controls ---

        var sliderProb = controller.Effects.addProperty("ADBE Slider Control");
        sliderProb.name = "Probability";
        sliderProb.property("Slider").setValue(50);
        // 0-100. Chance each layer is fully visible on any given quantized frame.
        // 50 = balanced flicker. 80+ = mostly visible with brief dropout.
        // 20- = sparse, stroboscopic.

        var sliderFPS = controller.Effects.addProperty("ADBE Slider Control");
        sliderFPS.name = "Speed (FPS)";
        sliderFPS.property("Slider").setValue(12);
        // 1-24. Rate at which the coin flip re-evaluates.
        // 24 = fastest flicker (every frame at 24fps comp).
        // 4-8 = slower, more legible state changes.
        // 1-2 = very slow, almost sequential.

        // --- New controls ---

        var sliderSeed = controller.Effects.addProperty("ADBE Slider Control");
        sliderSeed.name = "Seed";
        sliderSeed.property("Slider").setValue(9248);
        // 0-999999. Master seed for all randomness.
        // Change this number to get a completely different but fully
        // deterministic flicker pattern. Same seed = same animation,
        // every render. Equivalent to rolling seed in the web version.

        var sliderGhost = controller.Effects.addProperty("ADBE Slider Control");
        sliderGhost.name = "Ghost Opacity";
        sliderGhost.property("Slider").setValue(10);
        // 0-40. Opacity of a layer when the hyperspeed coin flip says OFF.
        // 0 = hard cut, layer fully disappears (original behavior).
        // 10 = faint ghost impression remains, preserving visual mass.
        // 30+ = soft dropout, more like a fade than a cut.

        var sliderFlow = controller.Effects.addProperty("ADBE Slider Control");
        sliderFlow.name = "Flow Blend";
        sliderFlow.property("Slider").setValue(25);
        // 0-60. Amount the continuous field flow adds to base opacity.
        // 0 = pure hyperspeed flicker only, no flow component.
        // 25 = subtle breathing underneath the flicker.
        // 50+ = strong continuous animation blended with flicker.
        // Field flow is a sine wave, per-layer phase offset by golden ratio,
        // so layers breathe in and out of phase with each other.

        var sliderFlowSpeed = controller.Effects.addProperty("ADBE Slider Control");
        sliderFlowSpeed.name = "Flow Speed";
        sliderFlowSpeed.property("Slider").setValue(1.0);
        // 0.1-5. Speed of the continuous field flow cycle.
        // 0.5 = slow, dreamy breathing.
        // 1.0 = moderate, natural feeling.
        // 3.0+ = rapid pulse.

        // 7. BUILD EXPRESSION
        // Two independent axes:
        //   Hyperspeed: binary on/off per layer per quantized frame, seed-driven.
        //   Field flow:  continuous sine wave per layer, phase-offset by index.
        // Final opacity = min(hyperspeed_base + field_flow, 100).

        var glitchExpr =
            "// HYPERSPEED + FIELD FLOW BLEND\n" +
            "// Author: dglxss v2.0\n" +
            "try {\n" +
            "    var fps        = thisComp.layer('CONTROLLER').effect('Speed (FPS)')('Slider');\n" +
            "    var probability= thisComp.layer('CONTROLLER').effect('Probability')('Slider');\n" +
            "    var masterSeed = thisComp.layer('CONTROLLER').effect('Seed')('Slider');\n" +
            "    var ghostOp    = thisComp.layer('CONTROLLER').effect('Ghost Opacity')('Slider');\n" +
            "    var flowBlend  = thisComp.layer('CONTROLLER').effect('Flow Blend')('Slider');\n" +
            "    var flowSpeed  = thisComp.layer('CONTROLLER').effect('Flow Speed')('Slider');\n" +
            "} catch(e) {\n" +
            "    var fps        = 12;\n" +
            "    var probability= 50;\n" +
            "    var masterSeed = 9248;\n" +
            "    var ghostOp    = 10;\n" +
            "    var flowBlend  = 25;\n" +
            "    var flowSpeed  = 1.0;\n" +
            "}\n" +
            "\n" +
            "// HYPERSPEED AXIS\n" +
            "// Quantize time so the coin flip holds for a full tick\n" +
            "var quantizedTime = Math.floor(time * fps);\n" +
            "seedRandom(masterSeed * 9999 + index * 999 + quantizedTime, true);\n" +
            "var hyperspeedOn  = random(0, 100) < probability;\n" +
            "var hyperspeedBase = hyperspeedOn ? 100 : ghostOp;\n" +
            "\n" +
            "// FIELD FLOW AXIS\n" +
            "// Each layer gets a unique phase offset (golden ratio spacing)\n" +
            "// so layers breathe independently rather than all in sync.\n" +
            "var phaseOffset = index * 2.39996; // 2*PI * golden ratio\n" +
            "var fieldFlow   = (Math.sin(time * flowSpeed + phaseOffset) * 0.5 + 0.5) * flowBlend;\n" +
            "\n" +
            "// BLEND\n" +
            "Math.min(hyperspeedBase + fieldFlow, 100);";

        // 8. ADD LAYERS AND APPLY EXPRESSION
        for (var i = 0; i < importedLayers.length; i++) {
            var layer = comp.layers.add(importedLayers[i]);
            layer.position.setValue([compWidth / 2, compHeight / 2]);
            layer.opacity.expression = glitchExpr;
        }

        // Move controller to top
        controller.moveToBeginning();

        app.endUndoGroup();

        alert(
            "Hyperspeed v2 ready.\n\n" +
            importedLayers.length + " layers imported.\n\n" +
            "CONTROLLER sliders:\n" +
            "  Probability    — % chance a layer is ON per tick (0-100)\n" +
            "  Speed (FPS)    — how fast the coin flips (1-24)\n" +
            "  Seed           — master seed, change to re-roll all randomness\n" +
            "  Ghost Opacity  — opacity of OFF layers (0=hard cut, 10=ghost)\n" +
            "  Flow Blend     — continuous field flow amount (0=flicker only)\n" +
            "  Flow Speed     — field flow cycle speed (0.1-5)\n\n" +
            "Tip: changing Seed gives a fully deterministic new animation.\n" +
            "Same seed always renders identically."
        );
    }

    createGlitchComp();
}
