<template>
  <div class="">
    <transition name="slide-fade">
      <div v-if="win" class="win">
        And the winner is "<span> {{ win }} </span>" 
        <button @click="newGame"> ... PLAY AGAIN ?</button>
      </div>
    </transition>
    <div class="main-game">
      <h2>Player</h2>
      <h2>AI</h2>
      <game-board
        ref="player"
        :player="true"
        :width="10"
        @turn-finished = "turnFinished('player')"
        @winner = "hasWon($event)"
        :key = "playerKey"
      />

      <game-board
        ref="ai"
        :player="false"
        :width="10"
        @turn-finished = "turnFinished('ai')"
        @winner = "hasWon($event)"
        :key = "aiKey"
      />

    </div>
  </div>
</template>

<script>
  import GameBoard from './components/Gameboard.vue'

  export default {
    data() {
      return {
        playerKey: 0,
        aiKey: 1000,
        win: ''
      }
    },

    components: {
      GameBoard
    },

    mounted() {
      this.setup()
    },

    methods: {
      setupBoard(board) {
        board.randomShip(5)
        board.randomShip(4)
        board.randomShip(3)
        board.randomShip(3)
        board.randomShip(2)
        board.randomShip(2)
        board.randomShip(1)
        board.randomShip(1)
      },
      turnFinished(finished) {
        const next = finished === 'player' ? 'ai' : 'player'
        this.$refs[finished].turn = false
        this.$refs[next].turn = true
      },
      newGame() {
        this.win = '';
        this.playerKey++;
        this.aiKey++;
        this.setup();
      },
      hasWon(winner) {
        this.win = winner;
      },
      setup() {
        this.$nextTick(() => {
          this.setupBoard(this.$refs.player)
          this.setupBoard(this.$refs.ai)
          this.$refs.ai.turn = true
        })
      }
    },
  }
</script>

<style lang="scss">
  body {
    font-family: 'Grenze Gotisch', cursive;
    background-color: rgb(29, 140, 231);
  }
  .main-game {
    margin: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 20px;
    justify-content: center;
    justify-items: center;
  }
  .win {
    text-align: center;
    font-size: 2rem;
    color: rgb(59, 201, 59);
  }
  span {
    font-size: 3rem;
    color: rgb(147, 247, 147);
  }
  button {
    font-family: 'Grenze Gotisch', cursive;
    font-size: 1.5rem;
    background-color: rgb(29, 140, 231);
    color: rgba(3, 51, 197, 0.966);
    text-decoration: underline;
    cursor: pointer;
    border: 2px solid rgb(29, 140, 231);
  }
  button:hover {
    text-decoration: none;
    background-color: rgba(3, 51, 197, 0.966);
    color: white;
    border: 2px solid rgb(29, 140, 231);
    border-radius: 5px;
  }
  .slide-fade-enter-active {
    transition: all .9s ease;
  }
  .slide-fade-leave-active {
    transition: all .9s ease;
  }
  .slide-fade-enter {
    transform: translateY(70px);
    opacity: 0;
  }
  .slide-fade-leave-to {
    transform: translateY(-70px);
    opacity: 0;
  }
</style>