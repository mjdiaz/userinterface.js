# userinterface.js

userinterface.js was built around the idea that logic relating to how the visual look and how the visual works should be separated and it should be clear that these are two distinct entities.

At the same time userinterface.js is providing a new way to write and organize your UI.

Another advantage of using userinterface.js is code reusability through principles of separation of concerns as well UI mechanism abstraction.


## Getting started

To get started with userinterface.js scaffold a new project by following the instructions on the [userinterface.js-skeleton](https://github.com/thoughtsunificator/userinterface.js-skeleton) repository.

### Directory structure

- data (json files etc.)
- lib (external & internal libraries)
- resource (stylesheet, images and such)
- src (userinterface.js models, objects and bindings)
- test (unit testing stuff)

### Models

A model is an object representation of a tree of [Nodes](https://developer.mozilla.org/en-US/docs/Web/API/Node).
It often goes along with a binding that is automatically called after a model is run as well as an Object that will mostly try to explain how the model works.

If you are mot sure what you can do with that you might want to [check out](https://github.com/thoughtsunificator/userinterface.js-samples) the demos I wrote using userinterface.js.

### Collection

userinterface.js also includes some some basic models to get you started head over to the [userinterface.js-collection](https://github.com/thoughtsunificator/userinterface.js-collection) repository to check them out.

## Examples

### Basic model

Code:
```js
UserInterface.model({
	name: "simplemodel",
	method: UserInterface.appendChild,
	properties: {
		count: 2, // assume count: 1 if omitted
		tagName: "li", // required
		className: "simplemodel",
		textContent: "My first simple model"
	}
});
UserInterface.runModel("simplemodel", {parentNode: document.querySelector("ul")});
```
Output:
```html
<ul>
	<li class="simplemodel">My first simple model</li>
	<li class="simplemodel">My first simple model</li>
</ul>
```

### Children

Code:
```js
UserInterface.model({
	name: "children",
	method: UserInterface.appendChild,
	properties: {
		tagName: "div",
		className: "model",
		children: [
			{
				tagName: "div",
				className: "child",
				textContent: "My first child"
				// and so on..
			}
		]
	},
	cssSelectors: ["body"]
});
UserInterface.runModel("children");
```
Output:
```html
<body>
	<div class="model">
		<div class="child">My first child</div>
	</div>
</body>
```

### Callback

Code:
```js
UserInterface.model(
	name: "echomodel",
	method: UserInterface.appendChild,
	callback: data => ({
		tagName: "p",
		className: "echomodel",
		textContent: "My "+data.text+" model",
		cssSelectors: ["body"]
	})
);
UserInterface.runModel("echomodel", {data: {"text": "echo" }});
```
Output:
```html
<p class="echomodel">My echo model</p>
```

### Binding

Code:
```js
UserInterface.model({
	name: "button",
	method: UserInterface.appendChild,
	properties: {
		tagName: "button"
	}
});
UserInterface.bind("button", function(element) {
	element.textContent = "bound";
});
UserInterface.runModel("button", {parentNode: document.body});
```
Output:
```html
<button>bound</button>
```

### Listener

```js
UserInterface.model({
	name: "myModel",
	method: UserInterface.appendChild,
	properties: {
		tagName: "div"
	}
});
UserInterface.bind("myModel", function(element) {
	let myObj = new Obj()
	element.addEventListener("click", function() {
		UserInterface.announce(myObj, "greeting", {})
	})
	UserInterface.runModel("someobscuremodel", {parentNode: document.body, bindingArgs:[myObj]})
});
UserInterface.bind("someobscuremodel", function(element, myObj) {
	UserInterface.listen(myObj, "greeting", function(data) {
		// do something useful with data or greet back
	})
});
UserInterface.runModel("button", {parentNode: document.body});
```
