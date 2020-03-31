(function() {

	const PROPERTIES_PROCESSED = ["count", "tagName", "children"]
	const APPEND_CHILD = "appendChild"
	const INSERT_BEFORE = "insertBefore"
	const REMOVE_ELEMENT = "removeElement"
	const UPDATE_ELEMENT = "updateElement"
	const REPLACE_ELEMENT = "replaceElement"
	const WRAP_ELEMENT = "wrapElement"
	const REMOVE_LISTENERS = "removeListeners"
	const METHODS_CREATE = [
		APPEND_CHILD,
		INSERT_BEFORE,
		REPLACE_ELEMENT,
		WRAP_ELEMENT
	]

	const _models = []
	const _listeners = []

	this.DEBUG = false
	this.appendChild = APPEND_CHILD
	this.insertBefore = INSERT_BEFORE
	this.removeElement = REMOVE_ELEMENT
	this.replaceElement = REPLACE_ELEMENT
	this.updateElement = UPDATE_ELEMENT
	this.wrapElement = WRAP_ELEMENT
	this.removeListeners = REMOVE_LISTENERS

	/**
	 * Load a model
	 * @param {object} 							model
	 * @param {string} 							model.name                  The name of the model
	 * @param {string} 							model.method                One of the following methods name: appendChild, insertBefore, removeElement, updateElement, replaceElement, wrapElement, removeListeners
	 * @param {?Object}							model.properties  					Processed properties along with any properties an Element¹ can have
	 * @param {?function}						model.callback  						Callback of processed properties along with any properties an Element¹ can have
	 * @param {number} 							[model.properties.count] 	 	The number of element
	 * @param {Object[]} 						[model.properties.children]	An array of the "properties" object
	 * @param {string[]} 						[model.cssSelectors]        The CSS selector(s) of the target(s)
	 */
	this.model = function(model) {
		if(typeof model === "undefined") {
			throw new Error(`"model" parameter is required.`)
		}
		if(typeof model !== "object") {
			throw new Error(`"model" parameter must be an object.`)
		}
		if(typeof model.name === "undefined") {
			throw new Error(`"model.name" parameter is required.`)
		}
		if(typeof model.name !== "string") {
			throw new Error(`"model.name" must be a string.`)
		}
		if(typeof model.method === "undefined") {
			throw new Error(`"model.method" parameter is required.`)
		}
		if(typeof model.method !== "string") {
			throw new Error(`"model.method" must be a string.`)
		}
		if(model.method !== REMOVE_ELEMENT && model.method !== REMOVE_LISTENERS) {
			if(typeof model.properties === "undefined" && typeof model.callback === "undefined") {
				throw new Error(`"model.properties" or "model.callback" parameter is required .`)
			}
			if(typeof model.properties !== "undefined" && typeof model.properties !== "object") {
				throw new Error(`"model.properties" must be an object.`)
			}
			if(typeof model.callback !== "undefined" && typeof model.callback !== "function") {
				throw new Error(`"model.callback" must be a function.`)
			}
		}
		if (this.DEBUG === true) {
			console.log("[model]", model.method, model.name)
		}
		_models.push(model)
	}

	/**
	 * Link a model to a "binding", that is a callback function
	 * @param {string} 	 name 	  The name of the model
	 * @param {function} callback The function binding the model
	*/
	this.bind = function(name, callback) {
		if(typeof name === "undefined") {
			throw new Error(`"name" parameter is required.`)
		}
		if(typeof name !== "string") {
			throw new Error(`"name" parameter must be a string.`)
		}
		if(typeof callback === "undefined") {
			throw new Error(`"callback" parameter is required.`)
		}
		if(typeof callback !== "function") {
			throw new Error(`"callback" parameter must be a function.`)
		}
		if (this.DEBUG === true) {
			console.log("[bind]", name)
		}
		_models.find(model => model.name === name).binding = {name, callback}
	}

	/**
	 * Update the DOM accordingly to a model
	 * @param {string}  name 		    						 The name of the model
	 * @param {Object}  [parameters]						 The parameters of the model
	 * @param {Object}  [parameters.data] 			 The data that will be echoed on the model
	 * @param {Element} [parameters.parentNode]	 The Element¹ each selector will query on
	 * @param {Array}   [parameters.bindingArgs] The arguments that go along with the binding
	 */
	this.runModel = async function(name, parameters = {}) {
		if(typeof name === "undefined") {
			throw new Error(`"name" parameter is required.`)
		}
		if(typeof name !== "string") {
			throw new Error(`"name" parameter must be a string.`)
		}
		if(typeof parameters !== "object") {
			throw new Error(`"parameters" parameter must be an object.`)
		} else {
			if(typeof parameters.parentNode !== "undefined" && typeof parameters.parentNode !== "object") {
				throw new Error(`"parameters.parentNode" parameter must be an Element.`)
			}
			if(typeof parameters.bindingArgs !== "undefined" && Array.isArray(parameters.bindingArgs) === false) {
				throw new Error(`"parameters.bindingArgs" parameter must be an array.`)
			}
		}
		if (this.DEBUG === true) {
			console.log("[runModel]", name)
		}
		const model = _models.find(model => model.name === name)
		if(typeof model === "undefined") {
			throw new Error(`Model "${name}" was not found. It might not have been loaded due to an error.`)
		}
		let { method, properties } = model
		if (model.hasOwnProperty("callback") === true) {
			properties = model.callback(parameters.data)
		}
		let targets = []
		if (model.hasOwnProperty("cssSelectors") === true && model.cssSelectors.length >= 1) {
			let parentNode = document
			if (parameters.hasOwnProperty("parentNode") === true) {
				parentNode = parameters.parentNode
			}
			targets = [].concat.apply([], model.cssSelectors.map(function(selector) {
				if (selector.startsWith("*") === true) {
					return [].slice.call(parentNode.querySelectorAll(selector.substring(1)))
				} else {
					return parentNode.querySelector(selector)
				}
			})).filter(target => target !== null)
		}
		if (targets.length === 0 && parameters.hasOwnProperty("parentNode") === true) {
			targets.push(parameters.parentNode)
		}
		if (method === WRAP_ELEMENT) {
			properties.count = targets.length
		}
		for (const [index, target] of targets.entries()) {
			let nodes = []
			if (METHODS_CREATE.includes(method) === true) {
				nodes = await UserInterface.createNodes(properties)
			}
			if (method === APPEND_CHILD) {
				nodes.forEach(element => target.appendChild(element))
			} else if (method === INSERT_BEFORE) {
				nodes.forEach(element => target.parentNode.insertBefore(element, target))
			} else if (method === REMOVE_ELEMENT) {
				target.parentNode.removeChild(target)
			} else if (method === REPLACE_ELEMENT) {
				target.parentNode.replaceChild(nodes[0], target)
			} else if (method === UPDATE_ELEMENT) {
				Object.assign(target, properties)
			} else if (method === WRAP_ELEMENT) {
				nodes[index].appendChild(target.cloneNode(true))
				target.parentNode.replaceChild(nodes[index], target)
			} else if (method === REMOVE_LISTENERS) {
				target.parentNode.replaceChild(target.cloneNode(true), target)
			}
			if (nodes.length >= 1 && model.hasOwnProperty("binding") === true) {
				await	model.binding.callback.apply(null, [nodes[0]].concat(parameters.bindingArgs))
			}
		}
	}

	/**
	 * Transform a model into one or many Elements
	 * @param   {?(Object|function)} properties	Processed properties along with any properties a Element can have or a callback returning them
	 * @returns {Element[]}                     An array of Elements¹
	 */
	this.createNodes = async function(properties) {
		const elements = []
		const {count = 1, tagName, children = []} = properties
		for (let i = 0; i < count; i++) {
			let currentTagName
			if (Array.isArray(tagName)) {
				currentTagName = tagName[i]
			} else {
				currentTagName = tagName
			}
			const element = document.createElement(currentTagName)
			Object.keys(properties).filter(property => PROPERTIES_PROCESSED.includes(property) === false).forEach(function(property) {
				if (Array.isArray(properties[property])) {
					element[property] = properties[property][i]
				} else {
					element[property] = properties[property]
				}
			})
			let currentChild
			if (children.length > 0 && Array.isArray(children[0])) {
				currentChild = children[i]
			} else {
				currentChild = children
			}
			for (let child of currentChild) {
				(await UserInterface.createNodes(child)).forEach(childElement => element.appendChild(childElement))
			}
			elements.push(element)
		}
		return elements
	}

	/**
	 * Returns the properties of a model
	 * @param  {string} name   The name of the model
	 * @param  {Object} [data] The data that will be echoed on the model
	 * @return {Object}	       The "properties" object of the model
	 */
	this.getModelProperties = function(name, data) {
		if(typeof name === "undefined") {
			throw new Error(`"name" parameter is required.`)
		}
		if(typeof name !== "string") {
			throw new Error(`"name" parameter must be a string.`)
		}
		const model = _models.find(model => model.name === name)
		if (model.hasOwnProperty("callback")) {
			return model.callback(data)
		} else if (model.hasOwnProperty("properties")) {
			return model.properties
		}
	}

	/**
	 * Load a listener
	 * @param  {*} 		  	context	 Where the announce will be broadcasted
	 * @param  {string}   title 	 The content of the message
	 * @param  {function} callback
	 */
	this.listen = function(context, title, callback) { // FIXME
		if(typeof context === "undefined") {
			throw new Error(`"context" parameter is required.`)
		}
		if(typeof title === "undefined") {
			throw new Error(`"title" parameter is required.`)
		}
		if(typeof title !== "string") {
			throw new Error(`"title" parameter must be a string.`)
		}
		if(typeof callback === "undefined") {
			throw new Error(`"callback" parameter is required.`)
		}
		if(typeof callback !== "function") {
			throw new Error(`"callback" parameter must be a function.`)
		}
		if (this.DEBUG === true) {
			console.log("(listen)", title)
		}
		_listeners.push({context, title, callback})
	}

	/**
	 * Message one or many listeners
	 * @param  {*} 			context Where the announce will be broadcasted
	 * @param  {string} title 	The title of the announce
	 * @param  {*} 			content The content of the announce
	 */
	this.announce = async function(context, title, content) { // FIXME
		if (this.DEBUG === true) {
			console.log("(announce)", title)
		}
		if(typeof context === "undefined") {
			throw new Error(`"context" parameter is required.`)
		}
		if(typeof title === "undefined") {
			throw new Error(`"title" parameter is required.`)
		}
		if(typeof title !== "string") {
			throw new Error(`"title" parameter must be a string.`)
		}
		const listeners = _listeners.filter(listener => listener.context === context && listener.title === title)
		for (const listener of listeners) {
			await listener.callback(content)
		}
	}

}).call(UserInterface = {})
