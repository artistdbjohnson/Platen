                        var currentClass = item.path.getAttribute('class') || '';
                        var cleanClass = currentClass.replace(/keyanim-path/g, '').replace(/keyanim-g\d+/g, '').trim();
                        item.path.setAttribute('class', (cleanClass + ' keyanim-path keyanim-g' + g).trim());
                        return { path: item.path, originalClass: cleanClass };
                    });
                
                if (_animatedPaths.length > 0 || _mappedPaths.length > 0) {
                    // CSS animations handle the rendering directly, no RAF loop required
                }
            }

            function stopAnimation() {
                if (_animCanvasOverride !== null) {
                    TRAITS.canvas = _animCanvasOverride;
                    if (typeof updateCanvasTexture === 'function') updateCanvasTexture();
                    _animCanvasOverride = null;
                }
                
                for (var i = 0; i < _animatedPaths.length; i++) {
                    var item = _animatedPaths[i];
