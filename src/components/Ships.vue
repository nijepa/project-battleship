<template>
  <div class="shi" :class="{ships: this.isSunked.find(x => x.index === shipIndex)}" >
    <p>{{ name }}</p>
  </div>
</template>

<script>
  export default {

    name: 'Ships',

    props: {
      size: { type: Number, required: true },
      player: {type: Boolean, default: true},
      shipIndex: {type: Number, default: 0},
      isSunked: {type: Array}
    },

    data() {
      return {
        name: '',
        ships: false
      }
    },

    computed: {
      display() {
        return true 
      },
    },

    mounted() {
      this.shipName()
    },

    methods: {
      shipName() {
        switch (this.size) {
          case 1:
            this.name = 'Patrol Boat';
            break;
          case 2:
            this.name = 'Submarine';
            break;
          case 3:
            this.name = 'Cruiser';
            break;
          case 4:
            this.name = 'Aircraft Carrier';
            break;
          case 5:
            this.name = 'Battle Ship';
            break;
        }
      }
    }
  }
</script>

<style lang="css" scoped>
  .ships {
    text-decoration: line-through;
    color: firebrick;
  }
  .shi {
    flex: 0 1 calc(20% - 8px);
    margin-right: .7rem;
  }
</style>