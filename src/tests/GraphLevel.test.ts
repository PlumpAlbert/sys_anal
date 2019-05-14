import GraphLevels from "../controllers/GraphLevels";

describe("Testing logic for Graph Levels", () => {
  let nodes: number[], links: Array<{ start: number; end: number }>;

  beforeEach(() => {
    (nodes = [1, 2, 3, 4]),
      (links = [
        { start: 1, end: 2 },
        { start: 1, end: 4 },
        { start: 2, end: 4 },
        { start: 3, end: 2 }
      ]);
  });

  it("Should find the root level", () => {
    let currentLevel: number[] = [];
    links.forEach(link => {
      // If we already found this node
      if (currentLevel.includes(link.start)) return;
      /**
       * Loop through all of the links to find out if
       * there's no links pointing to source node
       *
       * TODO
       ** Extremely unoptimized
       */
      let index = links.findIndex(v => v.end === link.start);
      // If there's any -- quit
      if (index !== -1) return;
      // Otherwise it's a root level node
      currentLevel.push(link.start);
    });
    expect(currentLevel).toEqual([1, 3]);
  });

  it("Should group nodes by levels", () => {
    /**
     * The array which represents the graph levels
     */
    let levels: Array<number[]> = [];
    while (links.length > 1) {
      let leftovers: typeof links = Object.create(links);
      let curLevel: number[] = [];
      links.forEach((link, linkIndex) => {
        if (curLevel.includes(link.start)) {
          leftovers.splice(linkIndex - (links.length - leftovers.length), 1);
          return;
        }
        let match = links.findIndex(v => v.end === link.start);
        if (match !== -1) return;
        curLevel.push(link.start);
        if (leftovers.length === 1) return;
        leftovers.splice(linkIndex - (links.length - leftovers.length), 1);
      });
      levels.push(curLevel);
      if (leftovers.length === 1) levels.push([leftovers[0].end]);
      links = leftovers;
    }
    expect(levels).toEqual([[1, 3], [2], [4]]);
  });

  fit("Should create ебучие уровни", () => {
    let levels: Array<number[]> = [[]];
    while (links.length) {
      // Массив с "необработанными" соединениями
      let newLinks: typeof links = Object.create(links);
      // Следующий уровень
      let nextLevel: number[] = [];
      // Для каждого соединения
      links.forEach((link, linkIndex) => {
        // Если начало уже добавлено в массив текущего уровня
        if (levels[levels.length - 1].includes(link.start)) {
          /**
           * Если в текущем уровне присутствует конечная вершина 
           * данного соединения
           */
          if (levels[levels.length - 1].includes(link.end)) {
            // Удалить ее отсюда
            let index = levels[levels.length - 1].indexOf(link.end);
            levels[levels.length - 1].splice(index, 1);
          }
          /**
           * Если в следующем уровне нет конечной вершины из 
           * данного соединения -- добавить её 
           */ 
          if (!nextLevel.includes(link.end)) nextLevel.push(link.end);
          // Удаляем текущее соединение из массива "необработанных" соединений
          newLinks.splice(linkIndex - (links.length - newLinks.length), 1);
          return;
        }
        /**
         * Находим соединение, в котором начальная вершина данного соединения
         * является конечной вершиной
         */
        if (links.find(v => link.start === v.end)) return;
        /**
         * Если такого не имеется -- данная вершина находится на этом уровне.
         * Добавляем её в массив уровней.
         */
        levels[levels.length - 1].push(link.start);
        // Добавляем конечную вершину в следующий уровень (если ее там нет)
        if (!nextLevel.includes(link.end)) nextLevel.push(link.end);
        // Помечаем текущее соединение как обработанное
        newLinks.splice(linkIndex - (links.length - newLinks.length), 1);
      });
      levels.push(nextLevel);
      links = newLinks;
    }
    expect(levels).toEqual([[1, 3], [2], [4]]);
  });
});
