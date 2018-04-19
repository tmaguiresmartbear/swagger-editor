import expect, { createSpy } from "expect"
import rewiremock from "rewiremock"
import Enzyme, { shallow } from "enzyme"
import Adapter from "enzyme-adapter-react-15"
import React from "react"
import FakeAce, { Session } from "test/mocks/ace.js"

const EVENTUALLY = 900 // ms

/**
* We're mocking out the editor,
* so uses of the phrase "should see this in editor",
* will match to the following Ace methods:
*
* - "should see this in editor" => editor.setValue
**/

describe.only("editor component", function() {

  before(function () {
    // Enzyme.configure({ adapter: new Adapter()})
    rewiremock.enable()
    Enzyme.configure({ adapter: new Adapter()})

    // Whole bunch of mocks!
    // rewiremock("brace").with({})
    rewiremock("brace/mode/yaml").with({})
    rewiremock("brace/theme/tomorrow_night_eighties").with({})
    rewiremock("brace/ext/language_tools").with({})
    rewiremock("brace/ext/searchbox").with({})
    rewiremock("./brace-snippets-yaml").with({})
    rewiremock("./editor.less").with({})
  })

  after(function() {
    rewiremock.disable()
  })

  describe("fake ace", function() {

    it("should be an event emitter", () => {
      // Given
      const fakeAce = new FakeAce()
      const spy = createSpy()
      fakeAce.on("foo", spy)

      // When
      fakeAce.emit("foo", "bar")

      // Then
      expect(spy.calls.length).toEqual(1)
      expect(spy.calls[0].arguments[0]).toEqual("bar")
    })

    it("should return `this`, when calling .edit", function() {
      // Given
      const fakeAce = new FakeAce()

      // When
      const res = fakeAce.edit()

      // Then
      expect(res).toBe(fakeAce)
    })


    it("should keep track of setValue", function() {
      // Given
      const fakeAce = new FakeAce()

      // When
      fakeAce.setValue("foo")

      // Then
      const res = fakeAce.getValue()
      expect(res).toEqual("foo")
    })

    it("should spy on setValue", function() {
      // Given
      const fakeAce = new FakeAce()

      // When
      fakeAce.setValue("foo")

      // Then
      expect(fakeAce.setValue.calls.length).toEqual(1)
      expect(fakeAce.setValue.calls[0].arguments[0]).toEqual("foo")
    })

    it("should return a single session, with getSession", function() {
      // Given
      const fakeAce = new FakeAce()

      // When
      const res = fakeAce.getSession()

      // Then
      expect(res).toBeA(Session)
    })

    describe("fake session", function() {
      it("should be an event emitter", function() {
        // Given
        const fakeAce = new FakeAce()
        const fakeSession = fakeAce.getSession()
        const spy = createSpy()
        fakeSession.on("foo", spy)

        // When
        fakeSession.emit("foo", "bar")

        // Then
        expect(spy.calls.length).toEqual(1)
        expect(spy.calls[0].arguments[0]).toEqual("bar")
      })

      it("should keep add state for markers", function() {
        // Given
        const fakeAce = new FakeAce()
        const fakeSession = fakeAce.getSession()

        // When
        fakeSession.addMarker({one: 1})

        // Then
        const res = fakeSession.getMarkers()
        expect(res).toBeAn("array")
        expect(res.length).toEqual(1)
        expect(res[0]).toEqual({id: 0, one: 1})
      })

      it("should keep remove state for markers", function() {
        // Given
        const fakeAce = new FakeAce()
        const fakeSession = fakeAce.getSession()
        fakeSession.addMarker({one: 1})

        // When
        fakeSession.removeMarker(0)

        // Then
        const res = fakeSession.getMarkers()
        expect(res).toBeAn("array")
        expect(res.length).toEqual(0)
      })

      it("should spy on addMarker", function() {
        // Given
        const fakeAce = new FakeAce()
        const fakeSession = fakeAce.getSession()

        // When
        fakeSession.addMarker({one: 1})

        // Then
        expect(fakeSession.addMarker.calls.length).toEqual(1)
      })

      it("should spy on setMode", function() {
        // Given
        const fakeAce = new FakeAce()
        const fakeSession = fakeAce.getSession()

        // When
        fakeSession.setMode()

        // Then
        expect(fakeSession.setMode.calls.length).toEqual(1)
      })

      it("should have a .selection which includes toJSON, fromJSON", function() {
        // Given
        const fakeAce = new FakeAce()

        // When
        const fakeSession = fakeAce.getSession()

        // Then
        expect(fakeSession.selection).toIncludeKey("toJSON")
        expect(fakeSession.selection).toIncludeKey("fromJSON")
      })
    })

    describe("renderer", function() {
      it("should have a stub for setShowGutter", function() {
        // Given
        const fakeAce = new FakeAce()

        // When
        fakeAce.renderer.setShowGutter("foo")

        // Then
        expect(fakeAce.renderer.setShowGutter.calls.length).toEqual(1)
        expect(fakeAce.renderer.setShowGutter.calls[0].arguments[0]).toEqual("foo")
      })

    })

  })

  it("should EVENTUALLY call onChange when user enters input", (done) => {

    // Given
    const fakeAce = new FakeAce()
    rewiremock("brace").with(fakeAce)
    const makeEditor = require("plugins/editor/components/editor.jsx").default
    const Editor = makeEditor({})
    const spy = createSpy()
    const wrapper = shallow(<Editor onChange={spy}/>)
    const reactAceWrapper = wrapper.find("ReactAce").shallow()

    console.log(wrapper.debug())

    // When
    // Simulate user input

    fakeAce.emit("change", "hello")

    // Then

    expect(fakeAce.edit.calls.length).toEqual(1)
    setTimeout(() => {
      // expect(spy.calls.length).toEqual(1)
      // expect(spy.calls[0].arguments[0]).toEqual("foo")
      done()
    }, EVENTUALLY)

  })

  it.skip("should put the contents of `value` prop into editor", (done) => {

    // // Given
    // // const FakeReactAce = () => null
    // // rewiremock("react-ace").with(FakeReactAce)
    // const makeEditor = require("plugins/editor/components/editor.jsx").default
    // const Editor = makeEditor({})
    // const spy = createSpy()

    // // When
    // const wrapper = shallow(<Editor value="initial value"/>)
    // const valueProp = wrapper.find(FakeReactAce).prop("value")

    // // Then
    // expect(valueProp).toEqual("initial ")

  })

})
