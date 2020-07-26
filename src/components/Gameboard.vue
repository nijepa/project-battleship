<template lang="html">
  <div class="#game-board">
    <div class="game-grid" :class="{ai: !player}">
      <game-ship
        v-for="(ship, index) in ships"
        ref="ships"
        :key="index"
        :ship-index="index"
        :player="player"
        :size="ship.size"
        :style="ships[index].style"
        :rotated="ship.start.x === ship.end.x"
        @sunked=shipSunked
      />
      <div
        v-for="(number, index) in numberOfSeaTiles"
        :id="'tile-' + index"
        :key="'sea-tile-' + index"
        :class="tileClass(index)"
        :style="tileStyle(index)"
        @click="hitTile(index)"
      >
        <img
          v-if="tileWasHit(index)"
          src="../assets/images/explosion.png"
          alt="Explosion"
        >
        <img
          v-if="tileWasMissed(index)"
          src="../assets/images/splash.png"
          alt="Splash"
        >
      </div>
    </div>
    <!-- <div class="test" /> -->
    <div class="shipo">
    <ships
        v-for="(ship, index) in ships"
        :key="index"
        :size="ship.size"
        :ship-index="index"
        :player="player"
        :isSunked="shipSunk"
      />
      </div>
    <!-- <div class="test" /> -->
  </div>
</template>

<script>
  import Ship from './Ship.vue';
  import Ships from './Ships.vue';

  export default {

    components: {
      'game-ship': Ship, Ships
    },

    props: {
      width: { type: Number, required: true },
      player: { type: Boolean, required: true }
    },

    data() {
      return {
        ships: [],
        missedAttacks: [],
        hits: [],
        turn: false,
        shipSunk: []
      }
    },

    computed: {
      numberOfShipTiles() {
        return this.ships.reduce((total, ship) => ship.size + total, 0)
      },
      numberOfBlankTiles() {
        return this.width * this.width - this.missedAttacks.length
      },
      numberOfMistTitles() {
        return this.player ? 0 : this.numberOfBlankTiles - this.hits.length
      },
      numberOfSeaTiles() {
        return this.width * this.width
      }
    },

    watch: {
      turn() {
        if (this.player && this.turn) {
          let x, y
          do {
            x = Math.floor(Math.random() * this.width)
            y = Math.floor(Math.random() * this.width)
          } while (!this.receiveAttack({ x, y }))
        }
      }
    },

    methods: {
      shipSunked(shipData) {
        let isSunked = this.shipSunk.find(x => x.index === shipData.index);
        if (!isSunked) {this.shipSunk.push(shipData);}
      },
      _checkWinner() {
        if (this.allShipsSunk()) {
          const winner = this.player ? 'AI' : 'Player'
          this.$emit('winner', winner)
          return true
        }
      },
      tileWasMissed(index) {
        const { x, y } = this._getRowColFrom(index)
        return this.missedAttacks.some(e => e.x === x && e.y === y)
      },
      _getRowColFrom(index) {
        return { x: index % this.width, y: Math.floor(index / this.width) }
      },
      tileWasHit(index) {
        const { x, y } = this._getRowColFrom(index)
        return this.hits.some(e => e.x === x && e.y === y)
      },
      hitTile(index) {
        this.turn && this.receiveAttack(this._getRowColFrom(index))
      },
      tileClass(index) {
        const { x, y } = this._getRowColFrom(index)
        const ships = this.$refs.ships
        const ship = this._shipAtPoint({ x, y })
        let shipEl
        if (ships) {
          shipEl = ships.find(vm => vm.shipIndex === ship)
        }
        const hitTile = this.tileWasHit(index) ? 'hit-tile ' : ''
        return hitTile + (this.player || (ships && shipEl && shipEl.isSunk())
          ? 'sea-tile tile'
          : 'mist-tile tile')
      },
      tileStyle(index) {
        const { y, x } = this._getRowColFrom(index)
        return { gridColumn: x + 1, gridRow: y + 1 }
      },
      valCoord(a) {
        return Number.isInteger(a) && a >= 0 && a < this.width
      },
      _shipAtPoint({ x, y }) {
        return this.ships.findIndex(ship => {
          return (
            (ship.start.x === x && ship.start.y <= y && ship.end.y >= y) ||
            (ship.start.y === y && ship.start.x <= x && ship.end.x >= x)
          )
        })
      },
      _shipOnPath({ start, end, mov, fix }) {
        let counter = start[mov]
        while (counter <= end[mov]) {
          if (this._shipAtPoint({ [fix]: start[fix], [mov]: counter }) >= 0)
            return true
          counter++
        }
        return false
      },
      _shipBetween({ start, end }) {
        let { mov, fix } =
          start.x === end.x ? { mov: 'y', fix: 'x' } : { mov: 'x', fix: 'y' }
        return this._shipOnPath({ start, end, mov, fix })
      },
      _setShipStyle({ start, end }) {
        return {
          gridColumnStart: `${start.x + 1}`,
          gridColumnEnd: `${end.x + 2}`,
          gridRowStart: `${start.y + 1}`,
          gridRowEnd: `${end.y + 2}`
        }
      },
      _newShipOn({ axis, start, end }) {
        const size = Math.abs(start[axis] - end[axis]) + 1
        return (
          size >= 1 &&
          size <= 5 &&
          this.ships.push({
            size,
            start,
            end,
            style: this._setShipStyle({ start, end })
          })
        )
      },
      newShip({ start, end }) {
        return (
          [start.x, start.y, end.x, end.y].every(this.valCoord) &&
          !this._shipBetween({ start, end }) &&
          ((start.x - end.x === 0 &&
            this._newShipOn({ axis: 'y', start, end })) ||
            (start.y - end.y === 0 && this._newShipOn({ axis: 'x', start, end })))
        )
      },
      randomShip(size) {
        let start = {}
        let end = {}
        let mov, fix
        do {
          mov = Math.random() > 0.5 ? 'x' : 'y'
          fix = mov === 'x' ? 'y' : 'x'
          start[fix] = Math.floor(Math.random() * this.width)
          start[mov] = Math.floor(Math.random() * (this.width - size))
          end[fix] = start[fix]
          end[mov] = size - 1 + start[mov]
        } while (!this.newShip({ start, end }))
      },
      receiveAttack({ x, y }) {
        if (
          this.missedAttacks.some(e => e.x === x && e.y === y) ||
          this.hits.some(e => e.x === x && e.y === y)
        ) {
          return false
        } else {
          this.$emit('turn-finished')
        }
        const shipIndex = this._shipAtPoint({ x, y })
        if (shipIndex >= 0) {
          const shipVM = this.$refs.ships.find(vm => vm.shipIndex === shipIndex)
          const { start, end } = this.ships[shipIndex]
          const location = start.x === end.x ? y - start.y : x - start.x
          return !!shipVM.hit(location) && !!this.hits.push({ x, y })  &&
          (this._checkWinner() || true)
        } else {
          return !!this.missedAttacks.push({ x, y })
        }
      },
      allShipsSunk() {
        return this.$refs.ships.every(ship => ship.isSunk())
      }
    }
  }
</script>

<style lang="css" scoped>
  .game-grid {
    display: grid;
    grid-auto-flow: row dense;
    grid-template-columns: repeat(10, 40px);
    grid-template-rows: repeat(10, 40px);
    border: 5px solid black;
    width: 400px;
    background-color: rgb(29, 140, 231);
  }
  .shipo {
    display: flex;
    flex-flow: row wrap;
    position: relative;
  }
  .ai {
    -webkit-box-shadow: 2px 2px 25px 23px rgba(252, 214, 46, 0.884);
    -moz-box-shadow: 2px 2px 25px 23px rgba(252, 214, 46, 0.884); 
    box-shadow: 2px 2px 25px 23px rgba(252, 214, 46, 0.884);
  }
  .tile {
    width: 100%;
    height: 100%;
    border: 1.5px solid rgba(150,50,50,0.4);
    border-radius: 7px;
  }
  .sea-tile {
    background-color: rgb(29, 140, 231);
    align-items: center;
    justify-items: center;
  }
  .ship.tile {
    z-index: 1;
  }
  @keyframes attack {
    0% {
      width: 1%;
      height: 1%;
      opacity: 0.2;
    }
    40% {
      width: 175%;
      height: 175%;
      opacity: 1;
    }
    60% {
      width: 50%;
      height: 50%;
      opacity: 1;
    }
    100% {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }
  .sea-tile img, .mist-tile img {
    animation: attack 750ms ease-in-out 0ms 1;
    z-index: 2;
    width: 100%;
    height: 100%;
  }
  .mist-tile {
    background-color: rgb(185, 166, 166);
    cursor: crosshair;
    display: grid;
    align-items: center;
    justify-items: center;
  }
  .hit-tile {
    background-color: transparent;
    z-index: 3;
  }
</style>