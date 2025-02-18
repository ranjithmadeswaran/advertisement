<?php

use Illuminate\Support\Facades\Route;
use Modules\Advertisement\app\Http\Controllers\AdvertisementController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/


Route::get('/admin/advertisements',[AdvertisementController::class, 'advadisment'])->name('admin.advadisment')->middleware('admin.auth');
Route::post('/admin/advertisement/create',[AdvertisementController::class, 'create'])->name('admin.advadisment.create')->middleware('admin.auth');
Route::post('/admin/advertisement/index',[AdvertisementController::class, 'index'])->name('admin.advadisment.index')->middleware('admin.auth');
Route::post('/admin/advertisement/edit',[AdvertisementController::class, 'edit'])->name('admin.advadisment.edit')->middleware('admin.auth');
Route::post('/admin/advertisement/delete',[AdvertisementController::class, 'delete'])->name('admin.advadisment.delete')->middleware('admin.auth');