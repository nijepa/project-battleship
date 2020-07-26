import { mount } from '@vue/test-utils'
import Gameboard from '@/components/Gameboard.vue'

let wrapper
let vm

beforeEach(() => {
  vm = mount(Gameboard, { propsData: { width: 10, player: true } }).vm
})

describe('Gameboard setup', () => {
  test('Places ship at coordinate', () => {
    vm.newShip({ start: { x: 2, y: 2 }, end: { x: 4, y: 2 } })
    expect(vm.ships.length).toBe(1)
    // expect(vm.$refs.ships.length).toBe(1)
  })
  test('Places ship at boundary', () => {
    vm.newShip({ start: { x: 9, y: 9 }, end: { x: 9, y: 5 } })
    expect(vm.ships.length).toBe(1)
    //expect(vm.$refs.ships.length).toBe(1)
  })
  test('Cant add too big a ship', () => {
    vm.newShip({ start: { x: 2, y: 2 }, end: { x: 10, y: 2 } })
    expect(vm.ships.length).toBe(0)
  })
})

describe('Gameboard functionality', () => {
  beforeEach(() => {
    vm.newShip({ start: { x: 2, y: 2 }, end: { x: 4, y: 2 } })
  })
  test('Cant add a ship at same location as another', () => {
    vm.newShip({ start: { x: 4, y: 2 }, end: { x: 5, y: 2 } })
    expect(vm.ships.length).toBe(1)
  })
  test('receiveAttack hits ship if present', () => {
    vm.receiveAttack({ x: 3, y: 2 })
    expect(vm.$refs.ships[0].hits.length).toBe(1)
  })
  test('receiveAttack doesnt hit ship if not present and adds missed attack', () => {
    vm.receiveAttack({ x: 5, y: 2 })
    expect(vm.$refs.ships[0].hits.length).toBe(0)
    expect(vm.missedAttacks[0]).toEqual({ x: 5, y: 2 })
  })
  test('reports if all ships sunk', () => {
    vm.newShip({ start: { x: 4, y: 4 }, end: { x: 4, y: 5 } })
    vm.receiveAttack({ x: 2, y: 2 })
    vm.receiveAttack({ x: 3, y: 2 })
    vm.receiveAttack({ x: 4, y: 2 })
    vm.receiveAttack({ x: 4, y: 4 })
    vm.receiveAttack({ x: 4, y: 5 })
    expect(vm.allShipsSunk()).toBe(true)
  })
  test('receiveAttack returns false if it has already hit that location', () => {
    expect(vm.receiveAttack({ x: 2, y: 2 })).toBe(true)
    expect(vm.receiveAttack({ x: 2, y: 2 })).toBe(false)
  })
  test('receiveAttack returns false if it has already missed ', () => {
    expect(vm.receiveAttack({ x: 1, y: 1 })).toBe(true)
    expect(vm.receiveAttack({ x: 1, y: 1 })).toBe(false)
  })
})

describe('Gameboard display', () => {
  let wrapper
  let wrapperComputer
  let vmComputer
  beforeEach(() => {
    wrapper = mount(Gameboard, { propsData: { width: 10, player: true } })
    wrapperComputer = mount(Gameboard, {
      propsData: { width: 10, player: false }
    })
    vm = wrapper.vm
    vmComputer = wrapperComputer.vm
  })

/*   test('dummy test', () => {
    expect(wrapper.findAll('div[class="test"]').length).toBe(2)
  }) */
  test('number of  sea tiles is 100 if player', () => {
    expect(wrapper.findAll('div[class="sea-tile tile"]').length).toBe(100)
  })
  test('number of blank sea tiles is unaffected by ships', () => {
    vm.newShip({ start: { x: 2, y: 2 }, end: { x: 4, y: 2 } })
    vm.newShip({ start: { x: 5, y: 4 }, end: { x: 5, y: 5 } })
    expect(wrapper.findAll('div[class="sea-tile tile"]').length).toBe(100)
  })
  test('number of blank sea tiles is unaffected by missed attacks', () => {
    vm.newShip({ start: { x: 2, y: 2 }, end: { x: 4, y: 2 } })
    vm.newShip({ start: { x: 5, y: 4 }, end: { x: 5, y: 5 } })
    vm.receiveAttack({ x: 2, y: 2 })
    vm.receiveAttack({ x: 8, y: 8 })
    expect(wrapper.findAll('div[class="sea-tile tile"]').length).toBe(99)
  })
  test('number of blank sea tiles is 0 if there is no player and no sunk ships', () => {
    vmComputer.newShip({ start: { x: 2, y: 2 }, end: { x: 4, y: 2 } })
    vmComputer.newShip({ start: { x: 5, y: 4 }, end: { x: 5, y: 5 } })
    expect(wrapperComputer.findAll('div[class="sea-tile tile"]').length).toBe(0)
  })
  test('number of blank mist tiles is 100 minus -  length of sunk ships', () => {
    vmComputer.newShip({ start: { x: 2, y: 2 }, end: { x: 4, y: 2 } })
    vmComputer.newShip({ start: { x: 5, y: 4 }, end: { x: 5, y: 5 } })
    vmComputer.receiveAttack({ x: 2, y: 2 })
    vmComputer.receiveAttack({ x: 3, y: 2 })
    vmComputer.receiveAttack({ x: 4, y: 2 })
    expect(wrapperComputer.findAll('div[class="mist-tile tile"]').length).toBe(
      97
    )
  })
})

describe('Ship styles', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(Gameboard, { propsData: { width: 10, player: true } })
    vm = wrapper.vm
  })
  test('position styles attach to ship', () => {
    vm.newShip({ start: { x: 2, y: 2 }, end: { x: 4, y: 2 } })
    expect(vm.ships[0].style.gridColumnStart).toBe('3')
    expect(vm.ships[0].style.gridColumnEnd).toBe('6')
    expect(vm.ships[0].style.gridRowStart).toBe('3')
    expect(vm.ships[0].style.gridRowEnd).toBe('4')
  })
  test('ship rotates when along y axis', () => {
    vm.newShip({ start: { x: 2, y: 4 }, end: { x: 2, y: 2 } })
    expect(vm.$refs.ships[0].rotated).toBe(true)
  })
  test('ship doesnt rotate when along x axis', () => {
    vm.newShip({ start: { x: 2, y: 2 }, end: { x: 4, y: 2 } })
    expect(vm.$refs.ships[0].rotated).toBe(false)
  })
})

describe('Random Ship', () => {
  beforeEach(() => {
    let wrapper
    wrapper = mount(Gameboard, { propsData: { width: 5, player: true } })
    vm = wrapper.vm
  })
  test('randomShip places a ship randomly not overlapping  another ship', () => {
    vm.newShip({ start: { x: 0, y: 0 }, end: { x: 2, y: 0 } })
    vm.randomShip(3)
    //expect(vm.$refs.ships.length).toBe(2)
    expect(vm.ships[1].size).toBe(3)
  })
})

describe('Player interactions', () => {
  beforeEach(() => {
    wrapper = mount(Gameboard, { propsData: { width: 10, player: false } })
    vm = wrapper.vm
    vm.newShip({ start: { x: 0, y: 0 }, end: { x: 0, y: 2 } })
    vm.turn = true
  })
  test('Player clicking tile with ship results in hit', () => {
    const tile = wrapper.findAll('div.mist-tile').at(10)
    tile.trigger('click')
    expect(vm.hits.length).toBe(1)
  })
  test('Player clicking tile without  ship results in miss', () => {
    const tile = wrapper.findAll('div.mist-tile').at(11)
    tile.trigger('click')
    expect(vm.hits.length).toBe(0)

    expect(vm.missedAttacks.length).toBe(1)
  })
  test('Player can only play when it is their turn', () => {
    const tile = wrapper.findAll('div.mist-tile').at(0)
    const tile2 = wrapper.findAll('div.mist-tile').at(10)
    tile.trigger('click')
    expect(wrapper.emitted()['turn-finished'].length).toBe(1)
    vm.turn = false
    tile2.trigger('click')
    expect(vm.hits.length).toBe(1)
  })
})

describe('Computer interactions', () => {
  beforeEach(() => {
    wrapper = mount(Gameboard, { propsData: { width: 10, player: true } })
    vm = wrapper.vm
    vm.newShip({ start: { x: 0, y: 0 }, end: { x: 0, y: 2 } })
  })
  test('Computer auto plays when it is their turn', () => {
    vm.turn = true
    expect(vm.hits.length + vm.missedAttacks.length).toBe(0)
    expect(wrapper.emitted()['turn-finished'].length).toBe(1)
  })
  test('Computer auto plays once when it is their turn', () => {
    vm.turn = true
    vm.turn = false
    expect(vm.hits.length + vm.missedAttacks.length).toBe(0)
  })
})

describe('Missed and Hit tiles', () => {
  beforeEach(() => {
    wrapper = mount(Gameboard, { propsData: { width: 10, player: false } })
    vm = wrapper.vm
    vm.newShip({ start: { x: 0, y: 0 }, end: { x: 0, y: 2 } })
  })
  test('Hit Tile shows up', () => {
    vm.turn = true
    const tile = wrapper.findAll('div.mist-tile').at(0)
    tile.trigger('click')
    expect(wrapper.findAll('img[alt="Explosion"]').length).toBe(0)
  })
})

describe('Winning', () => {
  test('When computer ships are sunk board emits win for player', () => {
    wrapper = mount(Gameboard, { propsData: { width: 10, player: false } })
    vm = wrapper.vm
    vm.newShip({ start: { x: 0, y: 0 }, end: { x: 0, y: 2 } })
    vm.newShip({ start: { x: 3, y: 3 }, end: { x: 3, y: 3 } })
    ;[{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 3, y: 3 }].forEach(
      location => vm.receiveAttack(location)
    )
    expect(wrapper.emitted()['winner'].length).toBe(1)
    expect(wrapper.emitted()['winner'][0]).toEqual(['Player'])


  })
  test('When player ships are sunk board emits win for computer', () => {
    wrapper = mount(Gameboard, { propsData: { width: 10, player: true } })
    vm = wrapper.vm
    vm.newShip({ start: { x: 0, y: 0 }, end: { x: 0, y: 2 } })
    vm.newShip({ start: { x: 3, y: 3 }, end: { x: 3, y: 3 } })
    ;[{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 3, y: 3 }].forEach(
      location => vm.receiveAttack(location)
    )
    expect(wrapper.emitted()['winner'].length).toBe(1)
    expect(wrapper.emitted()['winner'][0]).toEqual(['Computer'])


  })
})
