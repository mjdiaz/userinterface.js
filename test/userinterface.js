const HTML_TEMPLATE = "<!DOCTYPE html><head></head><body></body>"

var rewire = require("rewire")
var JSDOM = require("jsdom").JSDOM
var myDOM = new JSDOM()
document = myDOM.window.document

exports.setUp = async function(callback) {
	document.body.innerHTML = HTML_TEMPLATE
	delete UserInterface // delete current UserInterface object along with its data as it does not seem to be overriden when calling rewire twice
	rewire("../app/userinterface.js") // inject the global scope of userinterface.js to the current global scope

	callback()
}

exports.model = async function (test) {
	test.expect(1)

	const expected = '<div class="simplemodel" id="simplemodel">My first simple model</div>'
	await UserInterface.model({
		name: "nodeunit.simplemodel",
		method: UserInterface.appendChild, 
		properties: {
			tagName: "div",
			className: "simplemodel",
			id: "simplemodel",
			textContent: "My first simple model"
		},
		cssSelectors: ["body"]
	})
	await UserInterface.runModel("nodeunit.simplemodel")
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.count = async function (test) {   
	test.expect(1)

	const expected = '<div class="simplemodel">My simple model</div><div class="simplemodel">My simple model</div><div class="simplemodel">My simple model</div><div class="simplemodel">My simple model</div><div class="simplemodel">My simple model</div>'
	UserInterface.model({
		name: "nodeunit.simplecount", 
		method: UserInterface.appendChild, 
		properties: {
			count: 5,
			tagName: "div",
			className: "simplemodel",
			textContent: "My simple model"
		}, 
		cssSelectors: ["body"]
	})
	await UserInterface.runModel("nodeunit.simplecount")
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.arrayProperties = async function (test) {   
	test.expect(1)

	const expected = '<span class="simplemodel0">My first simple model</span><div class="simplemodel1">My second simple model</div><p class="simplemodel2">My third simple model</p><section class="simplemodel3"></section><h1 class="simplemodel4"></h1>'
	UserInterface.model({
		name: "nodeunit.arrayproperties",
		method: UserInterface.appendChild, 
		properties: {
			count: 5,
			tagName: ["span", "div", "p", "section", "h1"],
			className: ["simplemodel0", "simplemodel1", "simplemodel2", "simplemodel3", "simplemodel4"],
			textContent: ["My first simple model", "My second simple model", "My third simple model"]
		}, 
		cssSelectors: ["body"]
	})
	await UserInterface.runModel("nodeunit.arrayproperties")
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.modelWithMultipleTargets = async function (test) {
	test.expect(1)

	const expected = '<div class="content0"><div class="simplemodel">My first simple model</div></div><div class="content1"><div class="simplemodel">My first simple model</div></div><div class="content2"><div class="simplemodel">My first simple model</div></div>'
	document.body.innerHTML = '<div class="content0"></div><div class="content1"></div><div class="content2"></div>'
	UserInterface.model({
		method: UserInterface.appendChild,
		name: "nodeunit.multipletargets",
		properties: {
			tagName: "div",
			className: "simplemodel",
			property: 1,
			textContent: "My first simple model"
		}, 
		cssSelectors: [".content0", ".content1", ".content2"]
	})
	await UserInterface.runModel("nodeunit.multipletargets")
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.selectorAll = async function (test) {
	test.expect(1)

	const expected = '<div class="content0"><div class="simplemodel">My first simple model</div></div><div class="content0"><div class="simplemodel">My first simple model</div></div><div class="content0"><div class="simplemodel">My first simple model</div></div><div class="content1"><div class="simplemodel">My first simple model</div></div><div class="content2"><div class="simplemodel">My first simple model</div></div>'
	document.body.innerHTML = '<div class="content0"></div><div class="content0"></div><div class="content0"></div><div class="content1"></div><div class="content2"></div>'
	UserInterface.model({
		name: "nodeunit.selectorAll",
		method: UserInterface.appendChild,
		properties: {
			tagName: "div",
			className: "simplemodel",
			textContent: "My first simple model"
		}, 
		cssSelectors: ["*.content0", ".content1", ".content2"]
	})
	await UserInterface.runModel("nodeunit.selectorAll")
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.childNodes = async function (test) {  
	test.expect(1)

	const expected = '<div class="simplemodel">My first element<div class="child">My first child<div class="child">My first child child</div></div></div>'
	UserInterface.model({
		name: "nodeunit.children",
		method: UserInterface.appendChild, 
		properties: {
			tagName: "div",
			className: "simplemodel",
			textContent: "My first element",
			children: [
				{
					tagName: "div",
					className: "child",
					textContent: "My first child",
					children: [
						{						
							tagName: "div",
							className: "child",
							textContent: "My first child child"
						}
					]
				}
			]
		}, 
		cssSelectors: ["body"]
	})
	await UserInterface.runModel("nodeunit.children")
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.getModelProperties = async function (test) {
	test.expect(1)

	const expected = '<div class="simplemodel"><div class="data"><div>My first child</div></div><div></div><button></button><div><div></div></div></div>'
	UserInterface.model({
		name: "nodeunit.child",
		method: UserInterface.appendChild, 
		properties: {
			tagName: "div"
		}
	})
	UserInterface.model({
		name: "nodeunit.child2", 
		method: UserInterface.appendChild, 
		properties: {
			tagName: "div",
			children: [
				{
					tagName: "div"
				}
			]
		}
	})
	UserInterface.model({
		name: "nodeunit.childbutton",
		method: UserInterface.appendChild, 
		properties: {
			tagName: "button"
		}
	})
	UserInterface.model({
		name: "nodeunit.childdata",
		method: UserInterface.appendChild, 
		callback: data => ({
			tagName: "div",
			textContent: data.text
		})
	})
	UserInterface.model({
		method: UserInterface.appendChild, 
		name: "nodeunit.modelaschild",
		properties: {
			tagName: "div",
			className: "simplemodel",
			children: [
				{
					tagName: "div",
					className: "data",
					children: [
						UserInterface.getModelProperties("nodeunit.childdata", {
							text: "My first child"
						})
					]
				},
				UserInterface.getModelProperties("nodeunit.child"),
				UserInterface.getModelProperties("nodeunit.childbutton"),
				UserInterface.getModelProperties("nodeunit.child2")
			]
		}, 
		cssSelectors: ["body"]
	})
	await UserInterface.runModel("nodeunit.modelaschild")	
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.callback = async function (test) {   
	test.expect(1)

	const expected = '<p class="callback" id="simplemodel">My echo model<span>My echo model<span>My echo model</span></span></p>'
	UserInterface.model({
		name: "nodeunit.callback",
		method: UserInterface.appendChild, 
		callback: data => ({
			tagName: data.tagName,
			className: data.className,
			id: "simplemodel",
			textContent: "My "+data.textContent+" model",
			children: [
				{
					tagName: "span",
					textContent: "My "+data.textContent+" model",
					children: [
						{
							tagName: "span",
							textContent: "My "+data.textContent+" model"
						}
					]
				}
			]
		}), 
		cssSelectors: ["body"]
	})
	await UserInterface.runModel("nodeunit.callback", {
		data: {
			"tagName": "p",
			"textContent": "echo", 
			"className": "callback"
		}
	})
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.insertBefore = async function (test) {   
	test.expect(1)

	const expected = '<ul><li>First element</li><li>Second element</li><li>Third element</li></ul>'
	document.body.innerHTML = '<ul><li>First element</li><li>Third element</li></ul>'
	UserInterface.model({
		name: "nodeunit.listModel",
		method: UserInterface.insertBefore, 
		properties: {
			tagName: "li",
			textContent: "Second element"
		}, 
		cssSelectors: ["ul li:nth-child(2)"]
	})
	await UserInterface.runModel("nodeunit.listModel")
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.removeElement = async function (test) {   
	test.expect(1)

	const expected = '<div class="adiv"></div>'
	document.body.innerHTML = '<div class="adiv"></div><div class="removeme"></div>'
	UserInterface.model({
		name : "nodeunit.removeIt",
		method: UserInterface.removeElement, 
		cssSelectors: [".removeme"]
	})
	await UserInterface.runModel("nodeunit.removeIt")
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.replaceElement = async function (test) {   
	test.expect(1)

	const expected = '<span class="newelement"></span>'
	document.body.innerHTML = '<div class="oldelement"></div>'
	UserInterface.model({
		name: "nodeunit.removeIt",
		method: UserInterface.replaceElement, 
		properties: {
			tagName: "span",
			className: "newelement"
		}, 
		cssSelectors: [".oldelement"]
	})
	await UserInterface.runModel("nodeunit.removeIt")
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.updateElement = async function (test) {   
	test.expect(1)

	const text = "Published 02/06/2019"
	const expected = '<p>'+text+'</p>'
	document.body.innerHTML = '<p>Published 01/01/1900</p>'
	UserInterface.model({
		name: "nodeunit.updateDate", 
		method: UserInterface.updateElement, 
		properties: {
			textContent: text
		}, 
		cssSelectors: ["p"]
	})
	await UserInterface.runModel("nodeunit.updateDate")
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.wrapElement = async function (test) {   
	test.expect(1)

	const expected = '<div class="wrapper"><p></p><textarea></textarea></div><div class="wrapper"><p></p><textarea></textarea></div><div class="wrapper"><p></p><textarea></textarea></div>'
	document.body.innerHTML = '<textarea></textarea><textarea></textarea><textarea></textarea>'
	UserInterface.model({
		name: "nodeunit.makeAForm",
		method: UserInterface.wrapElement, 
		properties: {
			tagName: "div",
			className: "wrapper",
			children: [
				{
				tagName: "p",
				}
			]
		}, 
		cssSelectors: ["*textarea"]
	})
	await UserInterface.runModel("nodeunit.makeAForm")
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.bindings = async function (test) {   
	test.expect(1)

	const expected = '<button>bound</button><button></button>'
	UserInterface.model({
		name: "nodeunit.button",
		method: UserInterface.appendChild, 
		properties: {
			count: 2,
			tagName: "button"			
		},
		cssSelectors: ["body"]
	})	
	UserInterface.bind("nodeunit.button", function(element) {
		element.textContent = "bound"
	})
	await UserInterface.runModel("nodeunit.button")
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.bindingArgs = async function (test) {   
	test.expect(1)

	UserInterface.model({
		name: "nodeunit.button",
		method: UserInterface.appendChild, 
		properties: {
			tagName: "button"			
		},
		cssSelectors: ["body"]
	})	
	UserInterface.bind("nodeunit.button", function(element, text) {
		test.strictEqual(text, "bound")
	})
	await UserInterface.runModel("nodeunit.button", {bindingArgs: ["bound"]})

	test.done()
}

exports.bindingsNestedModels = async function (test) {   
	test.expect(1)

	const expected = '<button><button>bound</button></button>'
	UserInterface.model({
		name: "nodeunit.button",
		method: UserInterface.appendChild, 
		properties: {
			tagName: "button"			
		}
	})	
	UserInterface.model({
		name: "nodeunit.button2",
		method: UserInterface.appendChild, 
		properties: {
			tagName: "button"			
		}
	})	
	UserInterface.bind("nodeunit.button", async function(element) {
		await UserInterface.runModel("nodeunit.button2", {parentNode: element})
	})
	UserInterface.bind("nodeunit.button2", async function(element) {
		element.textContent = "bound"
	})
	await UserInterface.runModel("nodeunit.button", {parentNode: document.body})
	test.strictEqual(document.body.innerHTML, expected)
	test.done()
}

exports.removeListeners = async function (test) {
	test.expect(2)

	let clicked = false
	document.body.innerHTML = "<button></button>"
	document.querySelector("button").addEventListener("click", function() {
		clicked = true
	})
	UserInterface.model({
		name: "nodeunit.button",
		method: UserInterface.removeListeners, 
		cssSelectors: ["button"]
	})
	document.querySelector("button").click()
	test.strictEqual(clicked, true)
	clicked = false
	await UserInterface.runModel("nodeunit.button")  
	document.querySelector("button").click()
	test.strictEqual(clicked, false)

	test.done()
}

exports.parentNode = async function (test) {
	test.expect(1)

	const expected = '<div><button></button></div><div><button></button></div>'
	document.body.innerHTML = "<div></div><div></div>"
	UserInterface.model({
		name: "nodeunit.button", 
		method: UserInterface.appendChild, 
		properties: {
			tagName: "button"
		}
	})
	await UserInterface.runModel("nodeunit.button", {
		parentNode: document.querySelectorAll("div")[0]
	})
	await UserInterface.runModel("nodeunit.button", {
		parentNode: document.querySelectorAll("div")[1]
	})
	test.strictEqual(document.body.innerHTML, expected)

	test.done()
}

exports.listeners = async function (test) {
	let path = []
	test.expect(1)	
	function MyContext() {}
	function MyContext2() {}
	UserInterface.listen(MyContext, "test1", data => path.push("first"))
	UserInterface.listen(MyContext, "test1", data => path.push("second"))
	UserInterface.listen(MyContext, "test2", data => path.push("third"))
	UserInterface.listen(MyContext2, "test1", data => path.push("fourth"))
	await UserInterface.announce(MyContext, "test1")
	await UserInterface.announce(MyContext, "test2")
	await UserInterface.announce(MyContext2, "test1")
	test.deepEqual(path, [
		"first", "second", "third", "fourth"
	])
	test.done()
}

exports.listenersChained = async function (test) {
	test.expect(1)	
	let path = []
	function MyContext() {}
	UserInterface.listen(MyContext, "chained1", async function(data) {		
		path.push("chained1")
		await UserInterface.announce(MyContext, "chained2")
	})
	UserInterface.listen(MyContext, "chained2", async function(data) {		
		path.push("chained2")
		await UserInterface.announce(MyContext, "chained3")
	})
	UserInterface.listen(MyContext, "chained3", async function(data) {
		path.push("chained3")
	})
	await UserInterface.announce(MyContext, "chained1")
	test.deepEqual(path, [
		"chained1", "chained2", "chained3"
	])
	test.done()
}

exports.listenersNested = async function (test) {
	test.expect(1)	
	let path = []
	function MyContext() {}
	UserInterface.listen(MyContext, "nest1", async function(data) {
		path.push("nest1")
		await UserInterface.announce(MyContext, "nest2")
		await UserInterface.announce(MyContext, "nest5")
	})
	UserInterface.listen(MyContext, "nest2", async function(data) {	
		path.push("nest2")
		await UserInterface.announce(MyContext, "nest3")
		await UserInterface.announce(MyContext, "nest4")
	})
	UserInterface.listen(MyContext, "nest3", data => path.push("nest3"))
	UserInterface.listen(MyContext, "nest4", data => path.push("nest4"))
	UserInterface.listen(MyContext, "nest5", data => path.push("nest5"))
	await UserInterface.announce(MyContext, "nest1")
	await UserInterface.announce(MyContext, "nest1")
	await UserInterface.announce(MyContext, "nest1")
	test.deepEqual(path, [
		"nest1", "nest2", "nest3", "nest4", "nest5",
		"nest1", "nest2", "nest3", "nest4", "nest5",
		"nest1", "nest2", "nest3", "nest4", "nest5",
	])
	test.done()
}
