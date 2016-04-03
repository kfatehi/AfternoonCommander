captain
=====================

Display a bunch of things
each thing consists of one or more widgets
widgets can be anything (an image, a button, a text label, a polling status label, something defined entirely by remote resource for which js, css, and html is externally injected)

In www/js/controller.js, http://lab:8001/things is expected to return a JSON array of things.

# todo

* configurable thing-registry url
* cache thing-registry manifest so we dont lose widgets when its down
* store thing registry cache manifest and main config (registry url and whether to fetch at all) as separate config files in the itunes app folder, making running a registry optional
