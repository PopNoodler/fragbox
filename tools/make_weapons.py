# Blender headless: first-person weapon viewmodels for FragBox.
# Each gun is a named root (vm_ak47, vm_m1911, vm_m870) at the origin.
# Blender axes: gun runs along +Y (muzzle +Y → game -Z after export_yup),
# height in Z, width in X. Sizes are FULL extents. Furniture meshes that
# camo skins may reskin are prefixed 'cm_'.
import bpy, math, sys

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
for blockdata in (bpy.data.meshes, bpy.data.materials):
    for item in list(blockdata):
        blockdata.remove(item)

def mat(name, color, rough=0.7, metal=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*color, 1.0)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    return m

WOOD     = mat('WoodMat',     (0.29, 0.16, 0.06), rough=0.6)
DARKWOOD = mat('DarkWoodMat', (0.16, 0.08, 0.03), rough=0.6)
METAL    = mat('MetalMat',    (0.075, 0.095, 0.115), rough=0.45, metal=0.5)
BLACK    = mat('BlackMat',    (0.030, 0.034, 0.040), rough=0.55)
SILVER   = mat('SilverMat',   (0.35, 0.38, 0.42), rough=0.35, metal=0.8)

def block(name, size, loc, material, rot=None, bevel=0.006, taper=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if taper:  # narrow the -Y (rear) face for tapered stocks
        me = ob.data
        min_y = min(v.co.y for v in me.vertices)
        for v in me.vertices:
            if abs(v.co.y - min_y) < 1e-4:
                v.co.x *= taper
                v.co.z *= taper
    if rot:
        ob.rotation_euler = rot
    bv = ob.modifiers.new('bevel', 'BEVEL')
    bv.width = bevel
    bv.segments = 2
    bv.limit_method = 'ANGLE'
    ob.data.materials.append(material)
    return ob

def cyl(name, r, length, loc, material, axis='Y', rot_extra=0.0):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=length, vertices=10, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    if axis == 'Y':
        ob.rotation_euler = (math.pi / 2, 0, 0)
    ob.data.materials.append(material)
    return ob

def root_for(name, parts):
    r = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(r)
    for p in parts:
        world = p.location.copy()
        p.parent = r
        p.location = world
    return r

# ================= AK-47 =================
ak = []
ak.append(cyl('barrel',   0.021, 0.34, (0, 0.44, 0.015), BLACK))
ak.append(cyl('gastube',  0.016, 0.22, (0, 0.36, 0.055), METAL))
ak.append(block('sight',  (0.016, 0.03, 0.055), (0, 0.60, 0.045), BLACK))
ak.append(cyl('brake',    0.027, 0.07, (0, 0.635, 0.015), METAL))
ak.append(block('cm_handguard', (0.062, 0.20, 0.075), (0, 0.25, -0.005), WOOD))
ak.append(block('cm_receiver',  (0.066, 0.26, 0.088), (0, 0.03, -0.012), METAL))
ak.append(block('dustcover',    (0.056, 0.20, 0.03),  (0, 0.05, 0.036), BLACK))
ak.append(block('mag1', (0.05, 0.055, 0.10), (0, 0.10, -0.095), BLACK, rot=(0.18, 0, 0)))
ak.append(block('mag2', (0.05, 0.055, 0.095), (0, 0.135, -0.175), BLACK, rot=(0.55, 0, 0)))
ak.append(block('mag3', (0.05, 0.05, 0.08),  (0, 0.19, -0.24),  BLACK, rot=(0.95, 0, 0)))
ak.append(block('grip', (0.042, 0.05, 0.11), (0, -0.035, -0.10), DARKWOOD, rot=(-0.35, 0, 0)))
ak.append(block('cm_stock', (0.052, 0.20, 0.075), (0, -0.20, -0.02), WOOD, rot=(0.12, 0, 0), taper=0.75))
root_for('vm_ak47', ak)

# ================= M1911 =================
p = []
p.append(block('cm_slide', (0.052, 0.26, 0.055), (0, 0.02, 0.030), METAL, bevel=0.01))
p.append(cyl('muzzle', 0.016, 0.035, (0, 0.16, 0.026), BLACK))
p.append(block('frame',  (0.046, 0.19, 0.045), (0, 0.015, -0.014), BLACK))
p.append(block('grip',   (0.048, 0.055, 0.13), (0, -0.055, -0.083), DARKWOOD, rot=(0.28, 0, 0)))
p.append(block('hammer', (0.016, 0.03, 0.025), (0, -0.10, 0.035), METAL))
p.append(block('guard',  (0.04, 0.05, 0.012),  (0, 0.045, -0.052), BLACK))
p.append(block('sightR', (0.014, 0.02, 0.014), (0, -0.09, 0.062), BLACK))
p.append(block('sightF', (0.010, 0.015, 0.012), (0, 0.135, 0.062), BLACK))
root_for('vm_m1911', p)

# ================= M870 =================
sg = []
sg.append(cyl('barrel',  0.021, 0.42, (0, 0.36, 0.022), BLACK))
sg.append(cyl('magtube', 0.016, 0.34, (0, 0.30, -0.030), METAL))
sg.append(cyl('bead',    0.006, 0.012, (0, 0.565, 0.048), SILVER))
for i in range(3):
    sg.append(cyl('cm_pump%d' % i, 0.034, 0.045, (0, 0.21 + i * 0.055, -0.030), DARKWOOD))
sg.append(block('cm_receiver', (0.07, 0.22, 0.09), (0, 0.0, 0.0), METAL, bevel=0.012))
sg.append(block('ejport', (0.074, 0.07, 0.028), (0, 0.02, 0.012), BLACK))
sg.append(block('cm_stock', (0.058, 0.20, 0.082), (0, -0.20, -0.028), WOOD, rot=(0.16, 0, 0), taper=0.7))
sg.append(block('gripwed', (0.05, 0.06, 0.08), (0, -0.115, -0.055), DARKWOOD, rot=(0.5, 0, 0)))
root_for('vm_m870', sg)

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'models/weapons.glb'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_yup=True)
print('EXPORTED', out)
