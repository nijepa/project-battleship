<template>
  <div :class="shipTile" v-if= "display">
    <img :src="require(`../assets/images/ships/${size}${rotated ? 'R' : ''}.png`)"
          alt="ship"
    >
  </div>
</template>

<script>
  export default {

    name: 'Ship',

    props: {
      size: { type: Number, required: true },
      rotated: {type: Boolean, default: false},
      player: {type: Boolean, default: true},
      shipIndex: {type: Number, default: 0}
    },

    data() {
      return {
        hits: [],
        sunkenShip: {}
      }
    },

    computed: {
      display() {
        return this.player || this.isSunk()
      },
      shipTile() {
        return 'ship tile' + (this.isSunk() ? ' sunk' : '')
      }
    },

    methods: {
      hit(location) {
        return (
          !this.hits.includes(location) &&
          Number.isInteger(location) &&
          location <= this.size - 1 &&
          location >= 0 &&
          this.hits.push(location)
        )
      },
      isSunk() {
        if (this.hits.length >= this.size) {
          if (!this.sunkenShip.index) {
            this.sunkenShip.player = this.player;
            this.sunkenShip.index = this.shipIndex;
            this.$emit('sunked', this.sunkenShip)
          }
        }
        return this.hits.length >= this.size
      }
    }
  }
</script>

<style lang="css" scoped>
  img {
    width: 100%;
    height: 100%;
    transition: all 1.9s ease-in-out 0s;
  }
  .ship.tile {
    background-color: rgba(0,0,0,0);
  }
  .ship.sunk img {
    opacity: 0.6;
  }
</style>