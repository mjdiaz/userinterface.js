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

userinterface.js also includes some basic models to get you started head over to the [userinterface.js-collection](https://github.com/thoughtsunificator/userinterface.js-collection) repository to check them out.


### API

<dl>
<dt><a href="#model">model(model)</a></dt>
<dd><p>Create a model</p>
</dd>
<dt><a href="#bind">bind(name, callback)</a></dt>
<dd><p>Link a model and a given function</p>
</dd>
<dt><a href="#runModel">runModel(name, [parameters])</a></dt>
<dd><p>Fire a model</p>
</dd>
<dt><a href="#createNodes">createNodes(properties)</a> ⇒ <code>Array.&lt;Element&gt;</code></dt>
<dd><p>Create one or many Nodes</p>
</dd>
<dt><a href="#getModelProperties">getModelProperties(name, [data])</a> ⇒ <code>Object</code></dt>
<dd><p>Returns the properties of a model</p>
</dd>
<dt><a href="#listen">listen(context, title, callback)</a></dt>
<dd><p>Add a listener</p>
</dd>
<dt><a href="#announce">announce(context, title, content)</a></dt>
<dd><p>Message one or many listeners</p>
</dd>
</dl>

<a name="model"></a>

#### model(model)
Create a model

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| model | <code>type</code> |  |
| model.name | <code>string</code> | The name of the model |
| model.method | <code>string</code> | The name of the method |
| model.properties | <code>Object</code> | Processed properties along with any properties an Element¹ can have |
| model.callback | <code>function</code> | Callback of processed properties along with any properties an Element¹ can have |
| [model.properties.count] | <code>number</code> | The number of element |
| [model.properties.children] | <code>Array.&lt;Object&gt;</code> | An array of the "properties" object |
| [model.cssSelectors] | <code>Array.&lt;string&gt;</code> | The CSS selector(s) of the target(s) |

<a name="bind"></a>

#### bind(name, callback)
Link a model and a given function

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the model |
| callback | <code>function</code> | The function binding the model |

<a name="runModel"></a>

#### runModel(name, [parameters])
Fire a model

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the model |
| [parameters] | <code>Object</code> | The parameters of the model |
| [parameters.data] | <code>Object</code> | The data that will be echoed on the model |
| [parameters.parentNode] | <code>Object</code> | The Element¹ each selector will query on |
| [parameters.bindingArgs] | <code>Object</code> | The arguments that go along with the binding |

<a name="createNodes"></a>

#### createNodes(properties) ⇒ <code>Array.&lt;Element&gt;</code>
Create one or many Nodes

**Kind**: global function
**Returns**: <code>Array.&lt;Element&gt;</code> - An array of Nodes¹

| Param | Type | Description |
| --- | --- | --- |
| properties | <code>Object</code> \| <code>function</code> | Processed properties along with any properties an Element¹ can have or a callback returning them |

<a name="getModelProperties"></a>

#### getModelProperties(name, [data]) ⇒ <code>Object</code>
Returns the properties of a model

**Kind**: global function
**Returns**: <code>Object</code> - The "properties" object of the model

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the model |
| [data] | <code>Object</code> | The data that will be echoed on the model |

<a name="listen"></a>

#### listen(context, title, callback)
Add a listener

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| context | <code>\*</code> | Where the announce will be broadcasted |
| title | <code>string</code> | The content of the message |
| callback | <code>function</code> |  |

<a name="announce"></a>

#### announce(context, title, content)
Message one or many listeners

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| context | <code>\*</code> | Where the announce will be broadcasted |
| title | <code>string</code> | The title of the announce |
| content | <code>\*</code> | The content of the announce |


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

## Unit testing

- npm install
- npm install -g nodeunit
- nodeunit