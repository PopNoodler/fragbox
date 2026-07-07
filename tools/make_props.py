# Blender headless: world pickup props for FragBox.
# prop_medkit and prop_ammo, each a named root at the origin, ~0.6u wide,
# centered so the game's spin/bob group logic applies unchanged.
import bpy, math, sys

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
for blockdata in (bpy.data.meshes, bpy.data.materials):
    for item in list(blockdata):
        blockdata.remove(item)

def mat(name, color, rough=0.7, metal=0.0, emit=None, estr=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*color, 1.0)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1.0)
        b.inputs['Emission Strength'].default_value = estr
    return m

WHITE  = mat('CaseMat',  (0.88, 0.90, 0.92), rough=0.5)
RED    = mat('CrossMat', (0.75, 0.06, 0.05), rough=0.45, emit=(0.7, 0.05, 0.04), estr=0.9)
LATCH  = mat('LatchMat', (0.25, 0.28, 0.32), rough=0.4, metal=0.6)
OLIVE  = mat('CrateMat', (0.24, 0.27, 0.14), rough=0.85)
DKOLV  = mat('BandMat',  (0.13, 0.15, 0.07), rough=0.85)
BRASS  = mat('BrassMat', (0.78, 0.60, 0.18), rough=0.35, metal=0.7, emit=(0.45, 0.32, 0.06), estr=0.6)
STEEL  = mat('SteelMat', (0.35, 0.38, 0.42), rough=0.4, metal=0.6)

def block(name, size, loc, material, bevel=0.02, rot=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = size          # FULL extents
    bpy.ops.object.transform_apply(scale=True)
    if rot:
        ob.rotation_euler = rot
    bv = ob.modifiers.new('bevel', 'BEVEL')
    bv.width = bevel
    bv.segments = 2
    bv.limit_method = 'ANGLE'
    ob.data.materials.append(material)
    return ob

def cyl(name, r, length, loc, material, upright=False):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=length, vertices=10, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    if not upright:
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

# ================= medkit: rounded white case, red cross both faces, latch =================
mk = []
mk.append(block('case',   (0.56, 0.42, 0.40), (0, 0, 0), WHITE, bevel=0.05))
mk.append(block('lid',    (0.58, 0.44, 0.10), (0, 0, 0.17), WHITE, bevel=0.04))
mk.append(block('crossH', (0.34, 0.02, 0.11), (0, -0.22, 0.02), RED, bevel=0.008))
mk.append(block('crossV', (0.11, 0.02, 0.30), (0, -0.22, 0.02), RED, bevel=0.008))
mk.append(block('crossH2', (0.34, 0.02, 0.11), (0, 0.22, 0.02), RED, bevel=0.008))
mk.append(block('crossV2', (0.11, 0.02, 0.30), (0, 0.22, 0.02), RED, bevel=0.008))
mk.append(block('latch',  (0.10, 0.03, 0.07), (0, -0.225, 0.14), LATCH, bevel=0.006))
mk.append(block('hinge',  (0.30, 0.03, 0.04), (0, 0.225, 0.14), LATCH, bevel=0.006))
mk.append(block('handle', (0.24, 0.05, 0.05), (0, 0, 0.26), LATCH, bevel=0.012))
root_for('prop_medkit', mk)

# ================= ammo crate: olive box, dark bands, brass tips, rope handles =================
am = []
am.append(block('crate',  (0.60, 0.44, 0.34), (0, 0, -0.04), OLIVE, bevel=0.025))
am.append(block('band1',  (0.62, 0.10, 0.36), (-0.17, 0, -0.04), DKOLV, bevel=0.01))
am.append(block('band2',  (0.62, 0.10, 0.36), (0.17, 0, -0.04), DKOLV, bevel=0.01))
am.append(block('lidrim', (0.62, 0.46, 0.05), (0, 0, 0.13), DKOLV, bevel=0.012))
for i in range(4):
    x = -0.18 + (i % 2) * 0.36
    y = -0.09 + (i // 2) * 0.18
    am.append(cyl('shell%d' % i, 0.045, 0.22, (x * 0.6, y, 0.24), BRASS, upright=True))
    am.append(cyl('tip%d' % i, 0.028, 0.07, (x * 0.6, y, 0.37), STEEL, upright=True))
am.append(block('handleL', (0.05, 0.16, 0.04), (-0.315, 0, 0.0), LATCH))
am.append(block('handleR', (0.05, 0.16, 0.04), (0.315, 0, 0.0), LATCH))
root_for('prop_ammo', am)

# ================= industrial ceiling light =================
TUBE = mat('TubeMat', (0.95, 0.92, 0.78), rough=0.3, emit=(1.0, 0.95, 0.75), estr=2.2)
cl = []
cl.append(block('housing', (0.95, 0.30, 0.16), (0, 0, 0.05), STEEL, bevel=0.015))
cl.append(block('fin1', (0.02, 0.34, 0.10), (-0.30, 0, 0.02), LATCH, bevel=0.004))
cl.append(block('fin2', (0.02, 0.34, 0.10), (0.30, 0, 0.02), LATCH, bevel=0.004))
cl.append(block('tube', (0.78, 0.14, 0.05), (0, 0, -0.07), TUBE, bevel=0.008))
cl.append(block('stem', (0.06, 0.06, 0.14), (0, 0, 0.17), LATCH))
root_for('prop_ceillight', cl)

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'models/props.glb'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_yup=True)
print('EXPORTED', out)
