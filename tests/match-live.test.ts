import {
  getDisplayScore,
  isMatchLiveNow,
  isMatchStatusLive,
} from "../lib/match-live";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

const pastStart = new Date(Date.now() - 30 * 60 * 1000);
const futureStart = new Date(Date.now() + 60 * 60 * 1000);

(() => {
  assert(isMatchStatusLive("IN_PLAY") === true, "IN_PLAY is live status");
  assert(isMatchStatusLive("PAUSED") === true, "PAUSED is live status");
  assert(isMatchStatusLive("FINISHED") === false, "FINISHED is not live status");
})();

(() => {
  const live = getDisplayScore({
    homeScore: null,
    awayScore: null,
    liveHomeScore: 2,
    liveAwayScore: 1,
    matchStatus: "IN_PLAY",
    matchDate: pastStart,
  });
  assert(live.home === 2 && live.away === 1 && live.isLive === true, "shows live score when IN_PLAY");
})();

(() => {
  const finished = getDisplayScore({
    homeScore: 3,
    awayScore: 0,
    liveHomeScore: 2,
    liveAwayScore: 0,
    matchStatus: "FINISHED",
    matchDate: pastStart,
  });
  assert(
    finished.home === 3 && finished.away === 0 && finished.isFinished === true,
    "final score takes precedence over live fields"
  );
})();

(() => {
  assert(
    isMatchLiveNow({
      homeScore: null,
      awayScore: null,
      liveHomeScore: null,
      liveAwayScore: null,
      matchStatus: "IN_PLAY",
      matchDate: pastStart,
    }) === true,
    "IN_PLAY status marks match as live"
  );

  assert(
    isMatchLiveNow({
      homeScore: 1,
      awayScore: 0,
      liveHomeScore: null,
      liveAwayScore: null,
      matchStatus: "FINISHED",
      matchDate: pastStart,
    }) === false,
    "finished match is not live"
  );

  assert(
    isMatchLiveNow({
      homeScore: null,
      awayScore: null,
      liveHomeScore: null,
      liveAwayScore: null,
      matchStatus: "SCHEDULED",
      matchDate: futureStart,
    }) === false,
    "scheduled future match is not live"
  );
})();

console.log("\nAll match-live tests passed!");
