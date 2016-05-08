<?php
if(!isset($_REQUEST['word']) || strlen($_REQUEST['word'])==0){
    echo json_encode(['status'=>'error','message'=>'word not set']);
    exit;
}

$db=[
    'dsn' => 'mysql:host=localhost;dbname=gaudeamus',
    'username' => 'dict',
    'password' => 'dict',
    'charset' => 'utf8',
];
$dsn=preg_split("/[=;]/",preg_replace("/^\\w+:/",'',$db['dsn']));
for($i=0, $cnt=count($dsn); $i<$cnt; $i+=2){
    $config[$dsn[$i]]=$dsn[$i+1];
}



/* Подключение к серверу MySQL */
$link = mysqli_connect(
            $config['host'],  /* Хост, к которому мы подключаемся */
            $db['username'],       /* Имя пользователя */
            $db['password'],   /* Используемый пароль */
            $config['dbname']);     /* База данных для запросов по умолчанию */

if (!$link) {
    echo json_encode(['status'=>'error','message'=>"Невозможно подключиться к базе данных. Код ошибки: %s\n", mysqli_connect_error()]);
    exit;
}
mysqli_query($link, "set names utf8");



$word=preg_split("/\\W+/",$_REQUEST['word']);
$word=$word[0];
if(mb_strlen($word)<3){
    $sql="SELECT dict_word.ind AS word_id, dict_word.number AS disct_id,
                    dict_word.word ,dict_word.tranc, dict.`name` AS dist_name
          FROM dict INNER JOIN dict_word ON `dict_word`.number=`dict`.dict_id
          WHERE dict_word.word = '".  mysqli_real_escape_string($link,$word)."' LIMIT 5";
}else{
    $sql="SELECT dict_word.ind AS word_id, dict_word.number AS disct_id,
                    dict_word.word ,dict_word.tranc, dict.`name` AS dist_name
          FROM dict INNER JOIN dict_word ON `dict_word`.number=`dict`.dict_id
          WHERE dict_word.word LIKE '".  mysqli_real_escape_string($link,$word)."%' LIMIT 5";
}


/* Посылаем запрос серверу */
if ($result = mysqli_query($link, $sql)) {

    //print("Очень крупные города:\n");

    /* Выборка результатов запроса */
    $rows=[];
    while( $row = mysqli_fetch_assoc($result) ){
        $row['tranc']=trim($row['tranc']);
        $rows[]=$row;
    }

    /* Освобождаем используемую память */
    mysqli_free_result($result);
}

/* Закрываем соединение */
mysqli_close($link);

echo json_encode(['status'=>'success','rows'=>$rows]);