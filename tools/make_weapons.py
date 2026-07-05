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

# ================= MP5 =================
mp = []
mp.append(cyl('barrel', 0.017, 0.20, (0, 0.38, 0.012), BLACK))
mp.append(cyl('supp',   0.024, 0.10, (0, 0.46, 0.012), METAL))
mp.append(block('cm_body', (0.058, 0.28, 0.075), (0, 0.10, -0.004), METAL, bevel=0.01))
mp.append(block('cm_hguard', (0.055, 0.11, 0.062), (0, 0.27, -0.02), BLACK))
mp.append(block('fgrip', (0.036, 0.045, 0.09), (0, 0.24, -0.09), BLACK, rot=(-0.15, 0, 0)))
mp.append(block('mag1', (0.042, 0.05, 0.11), (0, 0.06, -0.10), BLACK, rot=(0.25, 0, 0)))
mp.append(block('mag2', (0.042, 0.048, 0.09), (0, 0.10, -0.185), BLACK, rot=(0.6, 0, 0)))
mp.append(block('grip', (0.04, 0.05, 0.10), (0, -0.04, -0.085), BLACK, rot=(-0.3, 0, 0)))
mp.append(block('stockbar', (0.03, 0.14, 0.024), (0, -0.16, 0.012), METAL))
mp.append(block('stockpad', (0.05, 0.03, 0.07), (0, -0.235, 0.0), BLACK))
root_for('vm_mp5', mp)

# ================= AWP =================
aw = []
aw.append(cyl('barrel', 0.020, 0.46, (0, 0.50, 0.02), METAL))
aw.append(cyl('muzz',   0.026, 0.05, (0, 0.745, 0.02), BLACK))
aw.append(block('cm_chassis', (0.062, 0.50, 0.085), (0, 0.10, -0.01), mat('AwpGreen', (0.11, 0.20, 0.07), rough=0.6), bevel=0.012))
aw.append(cyl('cm_scope', 0.035, 0.24, (0, 0.06, 0.085), BLACK))
aw.append(cyl('lensF', 0.040, 0.02, (0, 0.185, 0.085), METAL))
aw.append(cyl('lensR', 0.037, 0.02, (0, -0.065, 0.085), METAL))
aw.append(block('mount', (0.03, 0.10, 0.03), (0, 0.06, 0.045), BLACK))
aw.append(block('bolt', (0.06, 0.02, 0.02), (0.05, -0.015, 0.02), METAL, rot=(0, 0.5, 0)))
aw.append(block('mag', (0.05, 0.09, 0.06), (0, 0.16, -0.075), BLACK))
aw.append(block('grip', (0.042, 0.05, 0.11), (0, -0.06, -0.09), BLACK, rot=(-0.35, 0, 0)))
aw.append(block('cm_stock', (0.055, 0.22, 0.09), (0, -0.24, -0.025), mat('AwpGreen2', (0.11, 0.20, 0.07), rough=0.6), taper=0.7))
root_for('vm_awp', aw)

# ================= M249 =================
lm = []
lm.append(cyl('barrel', 0.024, 0.34, (0, 0.44, 0.02), BLACK))
lm.append(block('cm_hguard', (0.07, 0.20, 0.08), (0, 0.26, -0.005), METAL))
lm.append(cyl('gastube', 0.016, 0.24, (0, 0.30, -0.05), BLACK))
lm.append(block('bipodL', (0.014, 0.014, 0.14), (-0.03, 0.42, -0.09), METAL, rot=(0.3, 0, 0.35)))
lm.append(block('bipodR', (0.014, 0.014, 0.14), (0.03, 0.42, -0.09), METAL, rot=(0.3, 0, -0.35)))
lm.append(block('cm_receiver', (0.072, 0.30, 0.10), (0, 0.02, 0.0), METAL, bevel=0.012))
lm.append(block('boxmag', (0.09, 0.14, 0.12), (0, 0.05, -0.115), mat('OliveBox', (0.18, 0.20, 0.10), rough=0.8)))
lm.append(block('carry', (0.02, 0.12, 0.05), (0, 0.12, 0.075), BLACK, rot=(0.3, 0, 0)))
lm.append(block('grip', (0.042, 0.05, 0.11), (0, -0.09, -0.095), BLACK, rot=(-0.35, 0, 0)))
lm.append(block('cm_stock', (0.055, 0.16, 0.085), (0, -0.21, -0.01), METAL, taper=0.8))
root_for('vm_m249', lm)

# ================= M14 =================
dm = []
dm.append(cyl('barrel', 0.018, 0.28, (0, 0.46, 0.03), BLACK))
dm.append(block('sightF', (0.014, 0.02, 0.04), (0, 0.585, 0.06), BLACK))
dm.append(block('cm_stockfull', (0.06, 0.62, 0.075), (0, 0.05, -0.012), WOOD, bevel=0.01, taper=0.85))
dm.append(block('cm_topmetal', (0.05, 0.34, 0.04), (0, 0.18, 0.045), METAL))
dm.append(block('mag', (0.048, 0.10, 0.09), (0, 0.08, -0.09), BLACK, rot=(0.12, 0, 0)))
dm.append(block('guard', (0.04, 0.07, 0.012), (0, -0.02, -0.055), BLACK))
root_for('vm_m14', dm)

# ================= .44 Magnum =================
mg = []
mg.append(block('cm_barrel', (0.042, 0.30, 0.062), (0, 0.17, 0.030), SILVER, bevel=0.01))
mg.append(block('rib', (0.02, 0.30, 0.015), (0, 0.17, 0.068), METAL))
mg.append(cyl('cylinder', 0.036, 0.10, (0, 0.0, 0.012), SILVER))
mg.append(block('frame', (0.04, 0.13, 0.05), (0, -0.015, 0.012), SILVER))
mg.append(block('hammer', (0.014, 0.03, 0.028), (0, -0.085, 0.045), METAL))
mg.append(block('grip', (0.044, 0.055, 0.12), (0, -0.075, -0.075), DARKWOOD, rot=(0.3, 0, 0)))
root_for('vm_magnum', mg)

# ================= SSG 08 =================
sc = []
sc.append(cyl('barrel', 0.017, 0.40, (0, 0.46, 0.025), METAL))
sc.append(block('cm_chassis', (0.055, 0.44, 0.075), (0, 0.08, -0.005), mat('ScoutTan', (0.32, 0.26, 0.16), rough=0.65), bevel=0.01))
sc.append(cyl('cm_scope', 0.028, 0.18, (0, 0.05, 0.075), BLACK))
sc.append(cyl('lensF2', 0.032, 0.016, (0, 0.145, 0.075), METAL))
sc.append(block('mount2', (0.024, 0.08, 0.026), (0, 0.05, 0.042), BLACK))
sc.append(block('bolt2', (0.05, 0.018, 0.018), (0.045, -0.01, 0.025), METAL, rot=(0, 0.55, 0)))
sc.append(block('mag', (0.044, 0.08, 0.05), (0, 0.14, -0.065), BLACK))
sc.append(block('cm_stockS', (0.05, 0.18, 0.08), (0, -0.20, -0.02), mat('ScoutTan2', (0.32, 0.26, 0.16), rough=0.65), taper=0.72))
root_for('vm_ssg', sc)

# ================= FAMAS =================
fa = []
fa.append(cyl('barrel', 0.018, 0.22, (0, 0.42, 0.02), BLACK))
fa.append(block('cm_bodyF', (0.06, 0.46, 0.085), (0, 0.05, -0.01), mat('FamasGray', (0.20, 0.22, 0.18), rough=0.7), bevel=0.012, taper=0.8))
fa.append(block('cm_handle', (0.03, 0.30, 0.03), (0, 0.10, 0.08), mat('FamasGray2', (0.20, 0.22, 0.18), rough=0.7)))
fa.append(block('handleleg1', (0.024, 0.024, 0.05), (0, 0.23, 0.055), BLACK))
fa.append(block('handleleg2', (0.024, 0.024, 0.05), (0, -0.03, 0.055), BLACK))
fa.append(block('mag', (0.045, 0.055, 0.13), (0, 0.02, -0.10), BLACK, rot=(0.22, 0, 0)))
fa.append(block('grip', (0.04, 0.048, 0.10), (0, 0.14, -0.095), BLACK, rot=(-0.3, 0, 0)))
root_for('vm_famas', fa)

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'models/weapons.glb'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_yup=True)
print('EXPORTED', out)
