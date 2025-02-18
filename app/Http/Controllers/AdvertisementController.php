<?php

namespace Modules\Advertisement\app\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Modules\Advertisement\app\Models\SmartAd as ModelsSmartAd;
use Modules\Advertisement\Models\SmartAd;

class AdvertisementController extends Controller
{
    public function index(Request $request)
    {
        $orderBy = $request->input('order_by', 'desc');
        $sortBy = $request->input('sort_by', 'id');

        $advertisements = ModelsSmartAd::orderBy($sortBy, $orderBy)
            ->get();

        $data = [];

        foreach ($advertisements as $advertisement) {
            // Decode placements JSON
            $placements = !empty($advertisement->placements) ? json_decode($advertisement->placements, true) : [];

            // Extract first placement if available
            $firstPlacement = $placements[0] ?? ['position' => '', 'selector' => '', 'style' => ''];

            $data[] = [
                'id' => $advertisement->id,
                'name' => $advertisement->name,
                'slug' => $advertisement->slug,
                'body_data' => $advertisement->body,
                'adType' => $advertisement->adType,
                'image' => $advertisement->image ? asset('storage/' . $advertisement->image) : null,
                'imageUrl' => $advertisement->imageUrl,
                'imageAlt' => $advertisement->imageAlt,
                'views' => $advertisement->views,
                'clicks' => $advertisement->clicks,
                'status' => $advertisement->enabled,
                'position' => $firstPlacement['position'],
                'selector' => $firstPlacement['selector'],
                'style' => $firstPlacement['style'],
            ];
        }

        return response()->json([
            'code' => 200,
            'message' => __('Advertisement details retrieved successfully.'),
            'data' => $data
        ], 200);
    }


    public function advadisment()
    {
        return view('advertisement::advertisement.create');
    }

    public function create(Request $request)
    {
        $request->validate([
            'ad_name' => 'required|string|max:255',
            'ad_type' => 'required|string',
            'body' => 'nullable|string',
            'ad_position' => 'required|string',
            'ad_selector' => 'required|string',
            'ad_custom' => 'nullable|string',
            'status' => 'required|boolean',
            'ad_image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
            'ad_url' => 'nullable|string',
            'ad_alt' => 'nullable|string',
        ]);


        $adType = $request->ad_type;
        $adCustom = $request->ad_custom ?? '';
        $adSelector = $request->ad_selector ?? '';
        $adPosition = $request->ad_position ?? '';

        $imagePath = null;
        if ($adType === 'IMAGE' && $request->hasFile('ad_image')) {
            $imagePath = $request->file('ad_image')->store('image', 'public');
        }

        if ($adType === 'HTML') {
            $body = $request->body;
            $image = null;
            $imageUrl = null;
            $imageAlt = null;
        } else {
            $body = null;
            $image = $request->ad_image;
            $imageUrl = $request->ad_url;
            $imageAlt = $request->ad_alt;
        }

        $data = [
            'name' => $request->ad_name,
            'slug' => Str::slug($request->ad_name),
            'body' => $body,
            'adType' => $adType,
            'image' => $imagePath,
            'imageUrl' => $imageUrl,
            'imageAlt' => $imageAlt,
            'enabled' => $request->status,
            'placements' => json_encode([
                [
                    'position' => $adPosition,
                    'selector' => $adSelector,
                    'style' => $adCustom,
                ]
            ]),
        ];

        $smartAd = ModelsSmartAd::create($data);

        if ($smartAd) {
            return response()->json([
                'code' => 200,
                'message' => 'Advertisement created successfully',
                'data' => [],
            ], 200);
        } else {
            return response()->json([
                'code' => 500,
                'message' => 'Failed to create advertisement'
            ], 500);
        }
    }

    public function edit(Request $request)
    {
        $request->validate([
            'edit_ad_name' => 'required|string|max:255',
            'edit_ad_type' => 'required|string',
            'edit_body' => 'nullable|string',
            'edit_ad_position' => 'required|string',
            'edit_ad_selector' => 'required|string',
            'edit_ad_custom' => 'nullable|string',
            'edit_status' => 'required|boolean',
            'edit_ad_image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
            'edit_ad_url' => 'nullable|string',
            'edit_ad_alt' => 'nullable|string',
        ]);

        $id = $request->edit_id;

        $adType = $request->edit_ad_type;
        $adCustom = $request->edit_ad_custom ?? '';
        $adSelector = $request->edit_ad_selector ?? '';
        $adPosition = $request->edit_ad_position ?? '';

        $imagePath = null;
        if ($adType === 'IMAGE' && $request->hasFile('edit_ad_image')) {
            $imagePath = $request->file('edit_ad_image')->store('image', 'public');
        }

        if ($adType === 'HTML') {
            $body = $request->edit_body;
            $image = null;
            $imageUrl = null;
            $imageAlt = null;
        } else {
            $body = null;
            $image = $request->edit_ad_image;
            $imageUrl = $request->edit_ad_url;
            $imageAlt = $request->edit_ad_alt;
        }

        $data = [
            'name' => $request->edit_ad_name,
            'slug' => Str::slug($request->edit_ad_name),
            'body' => $body,
            'adType' => $adType,
            'imageUrl' => $imageUrl,
            'imageAlt' => $imageAlt,
            'enabled' => $request->edit_status,
            'placements' => json_encode([
                [
                    'position' => $adPosition,
                    'selector' => $adSelector,
                    'style' => $adCustom,
                ]
            ]),
        ];

        if (!empty($imagePath)) {
            $data['image'] = $imagePath;
        }

        $smartAd = ModelsSmartAd::where('id', $id)->update($data);

        if ($smartAd) {
            return response()->json([
                'code' => 200,
                'message' => 'Advertisement edited successfully',
                'data' => [],
            ], 200);
        } else {
            return response()->json([
                'code' => 500,
                'message' => 'Failed to edit advertisement'
            ], 500);
        }
    }

    public function delete(Request $request)
    {
        $request->validate([
            'id' => 'required',
        ]);

        $add = ModelsSmartAd::where('id', $request->input('id'))->firstOrFail();

        $add->delete();

        return response()->json(['code' => '200', 'success' => true, 'message' => 'Advertisement deleted successfully'], 200);
    }
}
