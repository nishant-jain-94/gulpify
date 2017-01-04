## Tasks

### Task Listing

- `gulp help`

	Displays all the available gulp tasks

### Code Analysis

- `gulp lint`

	Performs static code analysis on all the javascript files. Runs jshint and plato.

- `gulp lint --verbose`

	Displays all the files under analysis.

- `gulp plato`

	Performs code analysis using plato on all javascript files. Plato generates a report in the report folder.

### Testing

- `gulp serve-specs`

	Browses to the spec runner html page runs the unit tests in it. Inject any changes on the fly and reruns the tests.

- `gulp test`

	Runs all the unit tests. Depends on the lint for the testing.

### Cleaning up

- `gulp clean`

	Removes all the files from build and temp folder

- `gulp clean-images`

	Removes all the images from the build folder

- `gulp clean-code`

	Removes all the javascript files from the build folder.

- `gulp clean-fonts`

	Removes all the fonts from the build folder.

- `gulp clean-styles`

	Removes all the css from the build folder

### Fonts and Images

- `gulp fonts`

	Copy all the fonts from the source to the build folder

- `gulp images`

	Copy all the images from the source to the build folder

### Styles

- `gulp styles`

	Compiles less files to CSS, add vendor prefixes and copy to the build folder

### Bower Files

- `gulp wiredep`

	Looks up all the bower components main files and javascript source code then adds them to the index.html

### Serving Development Code

- `gulp serve-dev`

	Serves the development code and launches it in a browser. The goal of building for development is to do it as fast as possible, to keep development moving  efficiently. This task serves all the code from the source folder and compiles less to css in temp folder 

- `gulp serve-dev --debug`

	Launch debugger with node-inspector

- `gulp serve-dev --debug-brk`

	Launch the debugger and break it on the first line of the node-inspector

### Building Production Code

- `gulp optimize`

	Optimize all the javascript and styles, and move to build folder and then inject them to the index.html

- `gulp build`

	Copies all the fonts, copies images and runs `gulp optimize` to build the production code to the build folder

### Serving Production Code

- `gulp serve-build`

	Serve the optimized code from the build folder and launches it in a browser

- `gulp serve-build --debug`

	Launch debugger with node-inspector

- `gulp serve-build --debug-brk`

	Launch debugger and break on the first line of the node-inspector


