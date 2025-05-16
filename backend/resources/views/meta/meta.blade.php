<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta property="og:title" content="{{ $product->name }}">
    <meta property="og:description" content="{!! strip_tags(html_entity_decode($product->description)) !!}">
    <meta property="og:image" content="{{ env('APP_URL').'images/'.$product->image }}">
    <meta property="og:url" content="{{ $url }}">
    <meta property="og:type" content="product">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $product->name }}">
    <meta name="twitter:description" content="{!! strip_tags(html_entity_decode($product->description)) !!}">
    <meta name="twitter:image" content="{{ env('APP_URL').'images/'.$product->image }}">

    <meta name="description" content="{!! strip_tags(html_entity_decode($product->description)) !!}">
    <title>{{ $product->name }}</title>
</head>
<body>
<h1>{{ $product->name }}</h1>
<p>{!! html_entity_decode($product->description) !!}</p>
<img src="{{ env('APP_URL').'images/'.$product->image }}" alt="{{ $product->name }}">
</body>
</html>
