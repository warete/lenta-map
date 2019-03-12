$(document).ready(function () {
    //Вызываем функцию для инициализации карты
    mapInit();
});

function mapInit()
{
    var myMap; //Объект карты
    var placemarkCollections = {}; //Коллекция точек (если несколько городов)
    var placemarkList = {}; //Список точек для города
    var shopList = []; //Массив с данными из файла
    var cityId = 0; //индекс города

    function init() {

        // Создаем карту
        myMap = new ymaps.Map("map", {
            center: [56, 37],
            zoom: 8,
            controls: [],
            zoomMargin: [20]
        });

        //Проходимся по каждому городу
        for (var i = 0; i < shopList.length; i++) {

            // Создаём коллекцию меток для города
            var cityCollection = new ymaps.GeoObjectCollection();

            //Проходимся по магазинам в городе
            for (var c = 0; c < shopList[i].shops.length; c++) {
                //Записываем в переменную массив с данными о текущем городе
                var shopInfo = shopList[i].shops[c];
                //Массив с контентом точки на карте
                var ballonContent = [];

                //Заполняем контент точек
                ballonContent.push("<a href='" + shopInfo.info.link + "' target='_blank'><strong>" + shopInfo.info.name + "</strong> " + shopInfo.address + "</a>" + "<br><img src='" + shopInfo.info.img + "'>");

                //Создаём саму точку на карте с иконкой по координатам
                var shopPlacemark = new ymaps.Placemark(
                    shopInfo.coordinates,
                    {
                        hintContent: shopInfo.address,
                        balloonContent: ballonContent.join("<hr>")
                    },
                    {
                        iconLayout: 'default#image',
                        iconImageHref: 'img/lenta-logo.png',
                        iconImageSize: [30, 42],
                        iconImageOffset: [-5, -38]
                    }
                );

                if (!placemarkList[i]) placemarkList[i] = {};
                placemarkList[i][c] = shopPlacemark;

                // Добавляем метку в коллекцию
                cityCollection.add(shopPlacemark);

            }
            //ДОбавляем коллекцию в массив коллекций
            placemarkCollections[i] = cityCollection;

            // Добавляем коллекцию на карту
            myMap.geoObjects.add(cityCollection);
        }
        // Масштабируем и выравниваем карту так, чтобы были видны метки для выбранного города
        myMap.setBounds(placemarkCollections[cityId].getBounds(), {checkZoomRange:true}).then(function(){
            if(myMap.getZoom() > 15) myMap.setZoom(15); // Если значение zoom превышает 15, то устанавливаем 15.
        });
        //Заполняем блок с магазинами
        $('#shops').html('');
        for (var c = 0; c < shopList[cityId].shops.length; c++) {
            $('#shops').append('<li class="list-group-item" value="' + c + '">' + shopList[cityId].shops[c].address + '</li>');
        }
    }

    //Отправляем ajax-запрос к файлу с данными
    $.ajax({
        url: "data/map.json"
    }).done(function(data) {
        shopList = data;
        //Инициализируем карту
        ymaps.ready(init);
    });

    // Клик на адрес
    $(document).on('click', '#shops li', function () {
        var cityId = 0;
        var shopId = $(this).val(); //индекс текущего магазина

        //Делаем активным выбранный магазин в списке
        $("#shops li").removeClass("active");
        $(this).addClass("active");

        // Масштабируем и выравниваем карту так, чтобы были видны метки для выбранного магазина
        myMap.setBounds(placemarkCollections[cityId].getBounds(), {checkZoomRange:true}).then(function(){
            if(myMap.getZoom() > 15) myMap.setZoom(15); // Если значение zoom превышает 15, то устанавливаем 15.
            //Открываем информацию о магазине
            placemarkList[cityId][shopId].balloon.open();
        });
    });
}