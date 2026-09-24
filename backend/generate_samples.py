import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "static", "samples")
os.makedirs(SAMPLES_DIR, exist_ok=True)

def create_underwater_background(width, height, top_color, bottom_color, caustic_intensity=0.15, turbidity=0.1):
    """Generates realistic underwater gradient with caustics and light rays."""
    arr = np.zeros((height, width, 3), dtype=np.float32)
    for y in range(height):
        factor = y / float(height)
        r = top_color[0] * (1 - factor) + bottom_color[0] * factor
        g = top_color[1] * (1 - factor) + bottom_color[1] * factor
        b = top_color[2] * (1 - factor) + bottom_color[2] * factor
        arr[y, :] = [r, g, b]

    x_coords = np.linspace(0, 10 * np.pi, width)
    y_coords = np.linspace(0, 5 * np.pi, height)
    xv, yv = np.meshgrid(x_coords, y_coords)
    
    sunbeams = (np.sin(xv * 0.4 + yv * 0.2) * 0.5 + 0.5) ** 3
    sunbeam_fade = np.linspace(1.0, 0.1, height)[:, None]
    rays = sunbeams * sunbeam_fade * caustic_intensity * 255
    
    caustics = (np.sin(xv * 2.1 + np.cos(yv * 1.8)) + np.cos(xv * 1.3 - yv * 2.4) + 2) / 4.0
    caustics_fade = np.linspace(0.8, 0.2, height)[:, None]
    caustic_layer = caustics * caustics_fade * (caustic_intensity * 180)

    arr[:, :, 0] = np.clip(arr[:, :, 0] + rays * 0.3 + caustic_layer * 0.2, 0, 255)
    arr[:, :, 1] = np.clip(arr[:, :, 1] + rays * 0.7 + caustic_layer * 0.6, 0, 255)
    arr[:, :, 2] = np.clip(arr[:, :, 2] + rays * 0.9 + caustic_layer * 0.9, 0, 255)

    noise = np.random.normal(0, 6 * turbidity * 255, (height, width, 3))
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    
    img = Image.fromarray(arr)
    return img

def add_seabed(img, floor_height=180, sand_color=(38, 70, 83), coral_color=(42, 157, 143)):
    """Draws sandy seabed with coral silhouettes and stones."""
    draw = ImageDraw.Draw(img, "RGBA")
    w, h = img.size
    base_y = h - floor_height
    
    points = [(0, h)]
    for x in range(0, w + 20, 20):
        y = base_y + int(math.sin(x * 0.015) * 25 + math.cos(x * 0.04) * 15)
        points.append((x, y))
    points.append((w, h))
    
    draw.polygon(points, fill=(sand_color[0], sand_color[1], sand_color[2], 230))
    
    for (cx, cy, radius, color) in [
        (80, h - 140, 50, (30, 90, 80, 200)),
        (130, h - 100, 35, (40, 110, 95, 200)),
        (w - 120, h - 160, 65, (25, 80, 90, 200)),
        (w - 70, h - 110, 45, (35, 100, 110, 200)),
        (w // 2 - 100, h - 80, 30, (20, 60, 70, 180)),
    ]:
        draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color)

    for start_x in [40, 60, w - 50, w - 90, 320]:
        frond_pts = []
        for i in range(7):
            fx = start_x + math.sin(i * 0.9) * 15
            fy = h - 40 - i * 25
            frond_pts.append((fx, fy))
        for j in range(len(frond_pts) - 1):
            draw.line([frond_pts[j], frond_pts[j+1]], fill=(20, 120, 85, 170), width=6 - j//2)

    return img

def render_plastic_bottle(draw, box, angle=15, opacity=200):
    bx, by, bw, bh = box
    bottle_pts = [
        (bx + bw * 0.3, by),
        (bx + bw * 0.7, by),
        (bx + bw * 0.7, by + bh * 0.1),
        (bx + bw * 0.6, by + bh * 0.18),
        (bx + bw * 0.85, by + bh * 0.35),
        (bx + bw * 0.85, by + bh * 0.85),
        (bx + bw * 0.7, by + bh),
        (bx + bw * 0.3, by + bh),
        (bx + bw * 0.15, by + bh * 0.85),
        (bx + bw * 0.15, by + bh * 0.35),
        (bx + bw * 0.4, by + bh * 0.18),
        (bx + bw * 0.3, by + bh * 0.1),
    ]
    draw.polygon(bottle_pts, fill=(180, 225, 240, opacity), outline=(220, 245, 255, 240))
    draw.rectangle([bx + bw * 0.16, by + bh * 0.42, bx + bw * 0.84, by + bh * 0.62], fill=(20, 110, 180, 210))
    draw.rectangle([bx + bw * 0.3, by, bx + bw * 0.7, by + bh * 0.09], fill=(0, 100, 220, 240))
    draw.line([(bx + bw * 0.3, by + bh * 0.25), (bx + bw * 0.3, by + bh * 0.8)], fill=(255, 255, 255, 160), width=2)

def render_plastic_bag(draw, box):
    bx, by, bw, bh = box
    bag_pts = [
        (bx + bw * 0.2, by + bh * 0.3),
        (bx + bw * 0.1, by + bh * 0.1),
        (bx + bw * 0.3, by + bh * 0.05),
        (bx + bw * 0.4, by + bh * 0.25),
        (bx + bw * 0.6, by + bh * 0.25),
        (bx + bw * 0.7, by + bh * 0.05),
        (bx + bw * 0.9, by + bh * 0.1),
        (bx + bw * 0.8, by + bh * 0.35),
        (bx + bw * 0.95, by + bh * 0.7),
        (bx + bw * 0.75, by + bh * 0.95),
        (bx + bw * 0.4, by + bh * 0.9),
        (bx + bw * 0.15, by + bh * 0.95),
        (bx + bw * 0.05, by + bh * 0.6),
    ]
    draw.polygon(bag_pts, fill=(230, 240, 245, 140), outline=(255, 255, 255, 180))
    draw.line([(bx + bw * 0.3, by + bh * 0.35), (bx + bw * 0.6, by + bh * 0.7)], fill=(180, 210, 220, 150), width=2)
    draw.line([(bx + bw * 0.5, by + bh * 0.3), (bx + bw * 0.7, by + bh * 0.8)], fill=(180, 210, 220, 150), width=2)

def render_fishing_net(draw, box):
    bx, by, bw, bh = box
    draw.ellipse([bx, by, bx + bw, by + bh], fill=(15, 65, 60, 90), outline=(30, 160, 140, 160))
    cols = 7
    rows = 6
    for i in range(1, cols):
        x = bx + bw * (i / cols)
        draw.line([(x + math.sin(i) * 8, by), (x - math.cos(i) * 12, by + bh)], fill=(40, 190, 170, 190), width=2)
    for j in range(1, rows):
        y = by + bh * (j / rows)
        draw.line([(bx, y + math.sin(j) * 10), (bx + bw, y - math.sin(j) * 8)], fill=(40, 190, 170, 190), width=2)
    draw.arc([bx - 10, by + 10, bx + bw + 10, by + bh - 10], 20, 200, fill=(210, 140, 40, 220), width=3)

def render_beverage_can(draw, box, color=(200, 30, 30)):
    bx, by, bw, bh = box
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=8, fill=color, outline=(220, 220, 220, 230))
    draw.ellipse([bx + 2, by + 1, bx + bw - 2, by + bh * 0.2], fill=(190, 190, 200, 240), outline=(240, 240, 240, 255))
    draw.line([(bx + bw * 0.25, by + bh * 0.25), (bx + bw * 0.25, by + bh * 0.85)], fill=(255, 255, 255, 180), width=3)

def render_tire(draw, box):
    bx, by, bw, bh = box
    draw.ellipse([bx, by, bx + bw, by + bh], fill=(30, 35, 42, 240), outline=(60, 70, 80, 255), width=3)
    rim_w, rim_h = bw * 0.45, bh * 0.45
    rx, ry = bx + (bw - rim_w) / 2, by + (bh - rim_h) / 2
    draw.ellipse([rx, ry, rx + rim_w, ry + rim_h], fill=(15, 45, 60, 255), outline=(50, 60, 70, 200), width=2)
    for angle in range(0, 360, 30):
        rad = math.radians(angle)
        x1 = bx + bw/2 + math.cos(rad) * (bw/2 - 14)
        y1 = by + bh/2 + math.sin(rad) * (bh/2 - 14)
        x2 = bx + bw/2 + math.cos(rad) * (bw/2 - 2)
        y2 = by + bh/2 + math.sin(rad) * (bh/2 - 2)
        draw.line([(x1, y1), (x2, y2)], fill=(20, 25, 30, 255), width=3)

def render_rope(draw, pts, color=(210, 140, 40)):
    for i in range(len(pts) - 1):
        draw.line([pts[i], pts[i+1]], fill=color, width=7)
    for p in pts[::2]:
        draw.circle(p, radius=4, fill=(160, 100, 25))

def generate_all_samples():
    print("Generating high-resolution sample underwater images...")
    
    # Sample 1: Coral Reef Debris
    img1 = create_underwater_background(800, 560, (0, 150, 190), (0, 45, 75), caustic_intensity=0.22)
    img1 = add_seabed(img1, floor_height=170, sand_color=(45, 95, 105), coral_color=(35, 140, 130))
    d1 = ImageDraw.Draw(img1, "RGBA")
    render_plastic_bottle(d1, (240, 380, 70, 140), angle=25)
    render_plastic_bag(d1, (480, 180, 130, 150))
    render_beverage_can(d1, (120, 430, 48, 75), color=(215, 45, 45))
    img1.save(os.path.join(SAMPLES_DIR, "coral_reef_plastics.jpg"), quality=95)
    print("Saved coral_reef_plastics.jpg")

    # Sample 2: Deep Sea Ghost Fishing Net & Rope
    img2 = create_underwater_background(800, 560, (5, 60, 100), (2, 20, 40), caustic_intensity=0.08, turbidity=0.15)
    img2 = add_seabed(img2, floor_height=140, sand_color=(15, 35, 50))
    d2 = ImageDraw.Draw(img2, "RGBA")
    render_fishing_net(d2, (260, 160, 280, 240))
    rope_pts = [(120, 460), (180, 380), (280, 420), (390, 350), (490, 420), (620, 390), (710, 470)]
    render_rope(d2, rope_pts)
    render_plastic_bottle(d2, (150, 410, 45, 95))
    img2.save(os.path.join(SAMPLES_DIR, "deep_ghost_net.jpg"), quality=95)
    print("Saved deep_ghost_net.jpg")

    # Sample 3: Sandy Seabed Discarded Tire & Beverage Cans
    img3 = create_underwater_background(800, 560, (0, 120, 160), (0, 50, 80), caustic_intensity=0.18)
    img3 = add_seabed(img3, floor_height=210, sand_color=(40, 85, 95))
    d3 = ImageDraw.Draw(img3, "RGBA")
    render_tire(d3, (280, 290, 220, 170))
    render_beverage_can(d3, (160, 430, 52, 80), color=(30, 90, 200))
    render_beverage_can(d3, (560, 410, 50, 78), color=(220, 40, 40))
    render_rope(d3, [(480, 460), (520, 430), (580, 480)], color=(190, 130, 35))
    img3.save(os.path.join(SAMPLES_DIR, "seabed_tire_cans.jpg"), quality=95)
    print("Saved seabed_tire_cans.jpg")

    # Sample 4: Coastal Marine Floor Heavy Mixed Waste
    img4 = create_underwater_background(800, 560, (10, 90, 120), (5, 40, 60), caustic_intensity=0.12, turbidity=0.18)
    img4 = add_seabed(img4, floor_height=230, sand_color=(30, 65, 75))
    d4 = ImageDraw.Draw(img4, "RGBA")
    render_plastic_bottle(d4, (110, 340, 55, 110))
    render_beverage_can(d4, (220, 410, 46, 70), color=(210, 50, 50))
    render_plastic_bag(d4, (310, 210, 140, 130))
    render_fishing_net(d4, (460, 320, 180, 150))
    render_tire(d4, (570, 360, 160, 120))
    d4.polygon([(290, 470), (330, 470), (340, 430), (280, 430)], fill=(230, 230, 230, 220), outline=(255, 255, 255, 255))
    render_rope(d4, [(90, 490), (190, 470), (260, 510)])
    img4.save(os.path.join(SAMPLES_DIR, "coastal_heavy_debris.jpg"), quality=95)
    print("Saved coastal_heavy_debris.jpg")

    # Sample 5: Clear Tropical Reef
    img5 = create_underwater_background(800, 560, (0, 180, 220), (0, 70, 110), caustic_intensity=0.28)
    img5 = add_seabed(img5, floor_height=150, sand_color=(60, 120, 130), coral_color=(45, 170, 150))
    d5 = ImageDraw.Draw(img5, "RGBA")
    render_plastic_bottle(d5, (380, 350, 65, 130))
    img5.save(os.path.join(SAMPLES_DIR, "tropical_shallow_bottle.jpg"), quality=95)
    print("Saved tropical_shallow_bottle.jpg")

if __name__ == "__main__":
    generate_all_samples()
