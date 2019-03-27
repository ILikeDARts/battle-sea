
// Для пошуку сусідів точки з поля функція ця
// Приймає точку і масив клітинок
// Вертає масив точок (мона витягти координати)
function neighbor(point, array) {
  let result = [];

  array.forEach((elm) => {
    // X o o
    // o + o
    // o o o
    if (elm.x === (point.x - 1) && elm.y === (point.y - 1)) {
      result.push(elm);
    }
    // o X o
    // o + o
    // o o o
    else if (elm.x === (point.x - 1) && elm.y === point.y) {
      result.push(elm);
    } 
    // o o X
    // o + o
    // o o o
    else if (elm.x === (point.x - 1) && elm.y === (point.y + 1)) {
      result.push(elm);
    } 
    // o o o
    // X + o
    // o o o
    else if (elm.x === point.x && elm.y === (point.y - 1)) {
      result.push(elm);
    } 
    // o o o
    // o + X
    // o o o
    else if (elm.x === point.x && elm.y === (point.y + 1)) {
      result.push(elm);
    } 
    // o o o
    // o + o
    // X o o
    else if (elm.x === (point.x + 1) && elm.y === (point.y - 1)) {
      result.push(elm);
    } 
    // o o o
    // o + o
    // o X o
    else if (elm.x === (point.x + 1) && elm.y === point.y) {
      result.push(elm);
    } 
    // o o o
    // o + o
    // o o X
    else if (elm.x === (point.x + 1) && elm.y === (point.y + 1)) {
      result.push(elm);
    }
  });

  return result;
}


// Клітинка поля
class Point {
  constructor(pointX, pointY) {
    this.x = pointX;
    this.y = pointY;
    // Якшо 0 чи 2 - то поле пусте
    // Якшо 1 - то поле містить частину корабля чи він є однопалубний
    this._isEmpty = 0;
    // jsObject є для того шо так зручно
    this.jqObject = `${pointX}${pointY}`;
  }

  // getter і setter для знання про стан клітинки
  get isEmpty() {
    return this._isEmpty;
  }
  set isEmpty(value) {
    this._isEmpty = value;
  }

  // Статичний метод для генерації n об'єктів
  // Вертає ініціалізований масив точок (всі 0)
  static generatePoints(n) {
    let array = [];

    for(let i = 0; i < n; i++) {
      array.push(new Point(Math.trunc(i / 10), i % 10));
    }

    return array;
  }
}

// Клітинка поля з пріорітетом
class PriorityPoint extends Point {
  constructor(pointX, pointY, priority) {
    super(pointX, pointY);
    this.priority = priority;
  }
  
  // Для створення масиву точок з поміченим пріорітетом статична функція ця
  // Вертає ініціалізований масив точок (всі 0) з пріорітетом
  static generatePriorityPoints(n) {
    let array = [];
    let x = 0, y = 0, priority = 0;

    for(let i = 0; i < n; i++) {
      // Рахуємо координату
      x = Math.trunc(i / 10);
      y = i % 10;

      // 1 4 1 5
      // 4 1 5 1
      // 1 5 1 4
      // 5 1 4 1
      // Помічаємо по шаблону частини карти (тут ставимо 4 і 5)
      // Бо карту можна зручно розбити на такі шаблончики
      if ((x % 4 === 0) && ((y % 4 === 0) || (y % 4 === 1))) {
        priority = 4;
      } else if ((x % 4 === 0) && ((y % 4 === 2) || (y % 4 === 3))) {
        priority = 5;
      } else if ((x % 4 === 1) && ((y % 4 === 0) || (y % 4 === 1))) {
        priority = 4;
      } else if ((x % 4 === 1) && ((y % 4 === 2) || (y % 4 === 3))) {
        priority = 5;
      } else if ((x % 4 === 2) && ((y % 4 === 0) || (y % 4 === 1))) {
        priority = 5;
      } else if ((x % 4 === 2) && ((y % 4 === 2) || (y % 4 === 3))) {
        priority = 4;
      } else if ((x % 4 === 3) && ((y % 4 === 0) || (y % 4 === 1))) {
        priority = 5;
      } else if ((x % 4 === 3) && ((y % 4 === 2) || (y % 4 === 3))) {
        priority = 4;
      }
      
      // Базовий пріорітет для парних координат в парних рядках
      if ((x % 2 === 0) && (y % 2 === 0)) {
        priority = 1;
      }
      // Базовий пріорітет для непарних координат в непарних рядках
      else if ((x % 2 === 1) && (y % 2 === 1)) {
        priority = 1;
      }

      // Записуємо згенеровану точку з пріорітетом
      array.push(new PriorityPoint(x, y, priority));
    }

    return array;
  }
}

// Поле
class Pole {
  constructor(player_id) {
    this._pole = Point.generatePoints(100);
    this._player_id = player_id;
  }  

  get pole() {
    return this._pole;
  }

  get player_id(){
    return this._player_id;
  }

  // Стріляти
  // Приймає х, у
  // Вертає 'You miss!' - якшо мімо, і 'Nice shot.' - якшо попав
  boom(x, y) {
    let needJQObject = `${x}${y}`;

    // console.log('boom-up:' + need);
    let point = this._pole.find((elm) => {
      return elm.jqObject === needJQObject;
    });
    // console.log('boom-down:' + point.jqObject);

    if (point.isEmpty === 0 || point.isEmpty === 2) {
      return 'You miss!';
    } else if (point.isEmpty === 1) {
      return 'Nice shot.';
    }
  }
  
  // Заповнити корабликами
  generateShipField() {
    this.generateShip(4);

    this.generateShip(3);
    this.generateShip(3);
    
    this.generateShip(2);
    this.generateShip(2);
    this.generateShip(2);

    this.generateShip(1);
    this.generateShip(1);
    this.generateShip(1);
    this.generateShip(1);
  }
  
  // Для генерації кораблів функція ця
  // Приймає масив з клітинок і довжину корабля
  // Вставляє в масив зразу корабель (помічає сусідів шоб не путатись)
  generateShip(length) {
    let point;

    // Якшо корабель однопалубний, то шукаємо вільну клітинку і замазуємо клітинки шо стоять поруч
    if (length === 1) {

      // Шукаємо місце допоки не заповнимо клітинку
      do {
        point = Math.floor(Math.random() * this._pole.length);
        
        // Якшо клітинка пуста замазуємо
        if (this._pole[point].isEmpty === 0) {
          this._pole[point].isEmpty = 1;

          // Помічаємо для себе клітинки в які більше не мона ставити
          let neib = [];
          neib = neighbor(this._pole[point], this._pole);

          for (let i = 0; i < neib.length; i++) {
            for (let j = 0; j < this._pole.length; j++) {
              if ((neib[i].x === this._pole[j].x) && (neib[i].y === this._pole[j].y) && (this._pole[j] !== 0)) {
                this._pole[j].isEmpty = 2;
              }
            }
          }
          break;
        }
      } while (true);
    }
    // Якшо корабель більше ніж з однієї клітинки, то спочатку шукаємо місце, замазуємо в кінці
    else {
      // Поки все не зробимо
      do {
        point = Math.floor(Math.random() * this._pole.length);

        // Якщо точка занята, давай нову точку
        if (this._pole[point].isEmpty !== 0) {
          continue;
        }
        // Інакше тре знайти ше точки
        else {
          // Формуємо множину корабликів
          let place = this.findPlace(point, length);

          // Вибираємо кораблика
          let choise = Math.floor(Math.random() * place.length);
          // Хочему запомнити ше сусідів
          let neib = [];

          // Помічаємо кораблика і запомнюємо сусідів
          place[choise].forEach((elm) => {
            this._pole[elm].isEmpty = 1;
            neib.push(neighbor(this._pole[elm], this._pole));
          });
          
          // Для кожної точки кораблика рухаємося по його сусідах і якшо він 
          for (let i = 0; i < neib.length; i++) {
            neib[i].forEach((elm) => {
              for (let j = 0; j < this._pole.length; j++) {
                if ((elm.x === this._pole[j].x) && (elm.y === this._pole[j].y) && (this._pole[j] !== 0) && (this._pole[j].isEmpty === 0)) {
                  this._pole[j].isEmpty = 2;
                }
              }
            })
          }

          break;
        }
      } while (true);
    }
  }

  // Для виведення можливих кораблів з точки функція ця
  // Приймає поле, точку і довжину корабля
  // Вертає масив індексів вільних точок
  findPlace(point, length) {
    let result = [];

    switch (length) {
      case (2): {
        // console.log(result);
        
        if ((this._pole[point - 1] !== undefined) && (this._pole[point - 1].isEmpty === 0)) {
          result.push([point - 1, point]);
        }
        // console.log(result);
        if ((this._pole[point + 1] !== undefined) && (this._pole[point + 1].isEmpty === 0)) {
          result.push([point, point + 1]);
        }
        // console.log(result);
        if ((this._pole[point - 10] !== undefined) && (this._pole[point - 10].isEmpty === 0)) {
          result.push([point - 10, point]);
        }
        // console.log(result);
        if ((this._pole[point + 10] !== undefined) && (this._pole[point + 10].isEmpty === 0)) {
          result.push([point, point + 10]);
        }
        // console.log(result);
        
        break;
      }
      case (3): {
        // console.log(result);
        
        if ((this._pole[point - 2] !== undefined) && (this._pole[point - 2].isEmpty === 0) &&
            (this._pole[point - 1] !== undefined) && (this._pole[point - 1].isEmpty === 0)) {
          result.push([point - 2, point - 1, point]);
        }
        // console.log(result);
        if ((this._pole[point - 1] !== undefined) && (this._pole[point - 1].isEmpty === 0) &&
            (this._pole[point + 1] !== undefined) && (this._pole[point + 1].isEmpty === 0)) {
          result.push([point - 1, point, point + 1]);
        }
        // console.log(result);
        if ((this._pole[point + 1] !== undefined) && (this._pole[point + 1].isEmpty === 0) &&
            (this._pole[point + 2] !== undefined) && (this._pole[point + 2].isEmpty === 0)) {
          result.push([point, point + 1, point + 2]);
        }
        // console.log(result);
        if ((this._pole[point - 20] !== undefined) && (this._pole[point - 20].isEmpty === 0) &&
            (this._pole[point - 10] !== undefined) && (this._pole[point - 10].isEmpty === 0)) {
          result.push([point - 20, point - 10, point]);
        }
        // console.log(result);
        if ((this._pole[point - 10] !== undefined) && (this._pole[point - 10].isEmpty === 0) &&
            (this._pole[point + 10] !== undefined) && (this._pole[point + 10].isEmpty === 0)) {
          result.push([point - 10, point, point + 10]);
        }
        // console.log(result);
        if ((this._pole[point + 10] !== undefined) && (this._pole[point + 10].isEmpty === 0) &&
            (this._pole[point + 20] !== undefined) && (this._pole[point + 20].isEmpty === 0)) {
          result.push([point, point + 10, point + 20]);
        }
        // console.log(result);

        break;
      }
      case (4): {
        // console.log(result);
        
        if ((this._pole[point - 3] !== undefined) && (this._pole[point - 3].isEmpty === 0) &&
            (this._pole[point - 2] !== undefined) && (this._pole[point - 2].isEmpty === 0) &&
            (this._pole[point - 1] !== undefined) && (this._pole[point - 1].isEmpty === 0)) {
          result.push([point - 3, point - 2, point - 1, point]);
        }
        // console.log(result);
        if ((this._pole[point - 2] !== undefined) && (this._pole[point - 2].isEmpty === 0) &&
            (this._pole[point - 1] !== undefined) && (this._pole[point - 1].isEmpty === 0) &&
            (this._pole[point + 1] !== undefined) && (this._pole[point + 1].isEmpty === 0)) {
          result.push([point - 2, point - 1, point, point + 1]);
        }
        // console.log(result);
        if ((this._pole[point - 1] !== undefined) && (this._pole[point - 1].isEmpty === 0) &&
            (this._pole[point + 1] !== undefined) && (this._pole[point + 1].isEmpty === 0) &&
            (this._pole[point + 2] !== undefined) && (this._pole[point + 2].isEmpty === 0)) {
          result.push([point - 1, point, point + 1, point + 2]);
        }
        // console.log(result);
        if ((this._pole[point + 1] !== undefined) && (this._pole[point + 1].isEmpty === 0) &&
            (this._pole[point + 2] !== undefined) && (this._pole[point + 2].isEmpty === 0) &&
            (this._pole[point + 3] !== undefined) && (this._pole[point + 3].isEmpty === 0)) {
          result.push([point, point + 1, point + 2, point + 3]);
        }
        // console.log(result);
        if ((this._pole[point - 30] !== undefined) && (this._pole[point - 30].isEmpty === 0) &&
            (this._pole[point - 20] !== undefined) && (this._pole[point - 20].isEmpty === 0) &&
            (this._pole[point - 10] !== undefined) && (this._pole[point - 10].isEmpty === 0)) {
          result.push([point - 30, point - 20, point - 10, point]);
        }
        // console.log(result);
        if ((this._pole[point - 20] !== undefined) && (this._pole[point - 20].isEmpty === 0) &&
            (this._pole[point - 10] !== undefined) && (this._pole[point - 10].isEmpty === 0) &&
            (this._pole[point + 10] !== undefined) && (this._pole[point + 10].isEmpty === 0)) {
          result.push([point - 20, point - 10, point, point + 10]);
        }
        // console.log(result);
        if ((this._pole[point - 10] !== undefined) && (this._pole[point - 10].isEmpty === 0) &&
            (this._pole[point + 10] !== undefined) && (this._pole[point + 10].isEmpty === 0) &&
            (this._pole[point + 20] !== undefined) && (this._pole[point + 20].isEmpty === 0)) {
          result.push([point - 10, point, point + 10, point + 20]);
        }
        // console.log(result);
        if ((this._pole[point + 10] !== undefined) && (this._pole[point + 10].isEmpty === 0) &&
            (this._pole[point + 20] !== undefined) && (this._pole[point + 20].isEmpty === 0) &&
            (this._pole[point + 30] !== undefined) && (this._pole[point + 30].isEmpty === 0)) {
          result.push([point, point + 10, point + 20, point + 30]);
        }
        // console.log(result);

        break;
      }
    }

    return result;
  }
}

// Бот
class Player {
  constructor(player_id) {
    this.shipPointCounter = 20;
    this.maxShot = 100;
    this.successShot = 0;
    this.notSuccessShot = 0;
    this._player_id = player_id;
    // Базовий патерн за яким буде стріляти бот
    this._pointPriority = PriorityPoint.generatePriorityPoints(100);
  }

  // getter і setter для пріорітета стрільби
  get pointPriority() {
    return this._pointPriority;
  }  
  set pointPriority(array) {
    this._pointPriority = array;
  }

  get player_id() {
    return this._player_id;
  }
  
  // Поміняти пріорітет точки
  changePriority(point, value) {
    this._pointPriority.forEach((elm) => {
      if (elm.jqObject === point.jqObject) {
        elm.priority += value;
      }
    });
  }

  // Крикнути шо всьо збс (но без мата)
  avangersEndgame(msg) {
    alert('Yeah boy!!! ' + msg);
  }
}

// Письменник
class GameWriter {
  constructor (gameID) {
    this._gameID = gameID;
    this._story = [];
  }

  get gameID() {
    return this._gameID;
  }

  // Записати хід
  writeInStory(part) {
    this._story.push(part);
  }

  // Розказати історію
  tellStory() {
    let result = '';

    this._story.forEach((elm) => {
      result += elm + '\n';
    });

    return result;
  }
}