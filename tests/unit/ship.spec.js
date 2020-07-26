import { mount } from '@vue/test-utils'
import Ship from '@/components/Ship.vue'

let wrapper
let vm

beforeEach(() => {
  wrapper = mount(Ship, { propsData: { size: 3 } })
  vm = wrapper.vm
})

describe('Ship', () => {
  test('hit() adds a hit', () => {
    vm.hit(1)

    expect(vm.hits.length).toBe(1)
  })
  test('hit() only works on one location once', () => {
    vm.hit(1)
    vm.hit(1)
    expect(vm.hits.length).toBe(1)
  })
  test('hit() only works on location in ship', () => {
    vm.hit(6)
    expect(vm.hits.length).toBe(0)
  })
  test('isSunk() returns true if all positions hit', () => {
    vm.hit(0)
    vm.hit(1)
    vm.hit(2)
    expect(vm.isSunk()).toBe(true)
  })
  test('isSunk() returns false if no positions hit', () => {
    expect(vm.isSunk()).toBe(false)
  })
  test('isSunk() returns false if not all positions hit', () => {
    vm.hit(0)
    vm.hit(1)
    expect(vm.isSunk()).toBe(false)
  })
})
describe('Ship display', () => {
  test('ship displays image', () => {
    expect(wrapper.html()).toContain('img')
  })
  test('non sunk computer ships are invisible', () => {
    vm = mount(Ship, { propsData: { size: 3, player:false } }).vm
    expect(vm.display === true)


  })
  test(' player ships are visible', () => {
    vm = mount(Ship, { propsData: { size: 3, player:true } }).vm
    expect(vm.display === false)
  })
  test(' sunk computer ships are visible', () => {
    vm = mount(Ship, { propsData: { size: 3, player:false } }).vm
    vm.hit(0)
    vm.hit(1)
    vm.hit(2)
    expect(vm.display === false)

  })


})
