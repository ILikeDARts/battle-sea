
$(document).ready(() => {

  // Перша черга гравця, то ми ховаємо 2 кнопочки
  $('#player-one').find('.boom-but').hide();
  $('#player-two').find('.boom-but').hide();

  let poles = [ new Pole('player-one'), new Pole('player-two') ];
  let bots = [ new Player('player-one'), new Player('player-two') ];
  let turn = 1;
  let writer = new GameWriter(3);

  // Генеруємо поле
  poles.forEach((elm) => {
    elm.generateShipField();
    // // Малюємо на полі
    // elm.pole.forEach((elm_inner) => {
      //   // Для клітинки з такого поля дивимось
      //   switch (elm_inner.isEmpty) {
    //     // Є корабликом
    //     case 1: {
      //       // Шукаємо в елементі з ідентифікатором елемент з класом шо опишує клітинку кораблика
      //       $(`#${elm.player_id}`).find(`.${elm_inner.jqObject}`).addClass('marked');
      //       break;
      //     }
      //   }
      // });
    writer.writeInStory('Generate ship field for ' + elm.player_id + '...');
  });

  
  // Малюємо на полі #2
  poles[1].pole.forEach((elm_inner) => {
    // Для клітинки з такого поля дивимось
    switch (elm_inner.isEmpty) {
      // Є корабликом
      case 1: {
        // Шукаємо в елементі з ідентифікатором елемент з класом шо опишує клітинку кораблика
        $(`#${poles[1].player_id}`).find(`.${elm_inner.jqObject}`).addClass('marked');
        break;
      }
    }
  });
  writer.writeInStory('Painted ' + poles[1].player_id + ' pole...')

  // То буде результат попадання і клітинка на якій зупинився, а ше загальна кількість можливих пострілів
  let result, tryThisPole;
  let id;
  let current_pole, current_bot;

  // Коли клікаємо то бодя стріляє
  $('.boom-but').on('click', (e) => {

    // Якшо черга бота
    if (turn === 0) {
      current_bot = bots[0];
      current_pole = poles[1];

      // Бодя провіряє чи можна грати далі
      if((current_bot.shipPointCounter !== 0) && (current_bot.maxShot !== 0)) {
        // Бодя строє нові пріорітети
        current_bot.pointPriority.sort((a, b) => {
          if (a.priority > b.priority) {
            return -1;
          }
          if (a.priority < b.priority) {
            return 1;
          }
          return 0;
        });

        // Бодя бере наступну точку
        tryThisPole = current_bot.pointPriority.shift();
        // Стріляє і дивиться на результат
        result = current_pole.boom(tryThisPole.x, tryThisPole.y);

        // Мімо
        if (result === 'You miss!') {
          // Помітити клітинку як погану
          $(`#${current_pole.player_id}`).find(`.${tryThisPole.jqObject}`).addClass('miss');
          // Погратися з цілями
          current_bot.maxShot--;
          current_bot.notSuccessShot++;
          // Сховати кнопку і передати черга
          $('#player-one').find('.boom-but').hide();
          turn = 1;
          // Передати письменнику шо мімо
          writer.writeInStory(current_bot.player_id + ' - miss shot on ' + tryThisPole.x + tryThisPole.y + ' cell on field...');
        }
        // Попав
        else if (result === 'Nice shot.') {
          // Шукаємо сусідів
          let neib = neighbor(tryThisPole, current_bot.pointPriority);
          // Міняємо їх пріорітет
          neib.forEach((elm) => {
            // Для тих шо по прямій
            if (((elm.x === tryThisPole.x) && (elm.y !== tryThisPole.y)) || 
                (elm.x !== tryThisPole.x) && (elm.y === tryThisPole.y)) {
              current_bot.changePriority(elm, 10);
            }
            // Для тих шо по діагоналі
            else {
              // Шукаємо індекс в точках боді
              let winnerIndex = current_bot.pointPriority.findIndex((candidate) => {
                return candidate.jqObject === elm.jqObject;
              });

              // Якшо найшли то рісуємо на полі мертву точку і удаляємо його
              if (winnerIndex !== undefined) {
                $(`#${current_pole.player_id}`).find(`.${current_bot.pointPriority[winnerIndex].jqObject}`).addClass('dead');
                current_bot.pointPriority.splice(winnerIndex, 1);
              }
            }
          });
          
          // Помітити клітинку грецьким огньом і забрати звідти кораблика
          $(`#${current_pole.player_id}`).find(`.${tryThisPole.jqObject}`).addClass('on-fire');
          $(`#${current_pole.player_id}`).find(`.${tryThisPole.jqObject}`).removeClass('marked');

          // Погратися з цілями
          current_bot.maxShot--;
          current_bot.successShot++;
          current_bot.shipPointCounter--;
          // Передати письменнику шо попав
          writer.writeInStory(current_bot.player_id + ' - success shot on ' + tryThisPole.x + tryThisPole.y + ' cell on field...');
        }
      } else {
        // Похвалитися
        $('.boom-but').hide();
        current_bot.avangersEndgame('Nubas' + '\nsuccessShot: ' + current_bot.successShot + ' notSuccessShot: ' + current_bot.notSuccessShot + ' totalCount: ' + (current_bot.successShot + current_bot.notSuccessShot));
        writer.writeInStory(current_bot.player_id + ' win...');
        console.log(writer.tellStory());
      }
    }
  });

  // А тут стріляє гравець
  $('li').on('click', (e) => {
    // Якшо черга гравця
    if (turn === 1) {
      current_bot = bots[1];
      current_pole = poles[0];

      // Бодя провіряє чи можна грати далі
      if((current_bot.shipPointCounter !== 0) && (current_bot.maxShot !== 0)) {
        // Шукаємо клітинку, запам'ятовуємо її і видаляємо з списку
        id = current_bot.pointPriority.indexOf(current_bot.pointPriority.find((elm) => {
          return elm.jqObject === e.currentTarget.classList[0];
        }));
        tryThisPole = current_bot.pointPriority[id];
        current_bot.pointPriority.splice(id, 1);

        // Стріляє і дивиться на результат
        result = current_pole.boom(tryThisPole.x, tryThisPole.y);

        // Мімо
        if (result === 'You miss!') {
          // Помітити клітинку як погану
          $(`#${current_pole.player_id}`).find(`.${tryThisPole.jqObject}`).addClass('miss');
          // Поміняти цілі, показати кнопочку і передати чергу
          current_bot.maxShot--;
          current_bot.notSuccessShot++;
          $('#player-one').find('.boom-but').show();
          turn = 0;
          // Передати письменнику шо мімо
          writer.writeInStory(current_bot.player_id + ' - miss shot on ' + tryThisPole.x + tryThisPole.y + ' cell on field...');
        }
        // Попав
        else if (result === 'Nice shot.') {        
          // Помітити клітинку грецьким огньом і забрати звідти кораблика
          $(`#${current_pole.player_id}`).find(`.${tryThisPole.jqObject}`).addClass('on-fire');
          $(`#${current_pole.player_id}`).find(`.${tryThisPole.jqObject}`).removeClass('marked');

          // Поміняти цілі
          current_bot.maxShot--;
          current_bot.successShot++;
          current_bot.shipPointCounter--;
          // Передати письменнику шо попав
          writer.writeInStory(current_bot.player_id + ' - success shot on ' + tryThisPole.x + tryThisPole.y + ' cell on field...');
        }
      } else {
        // Похвалитися всім
        $('.boom-but').hide();
        current_bot.avangersEndgame('successShot: ' + current_bot.successShot + ' notSuccessShot: ' + current_bot.notSuccessShot + ' totalCount: ' + (current_bot.successShot + current_bot.notSuccessShot));
        writer.writeInStory(current_bot.player_id + ' win...');
        console.log(writer.tellStory());
      }
    } else {
      alert('Харош жати');
    }
  });
});