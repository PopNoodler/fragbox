# Blender headless: low-poly soldier for FragBox.
# Named parts match the game's animation contract:
#   legL/legR pivot at hip (y=0.72), armL/armR pivot at shoulder (y=1.46).
# Blender Z-up here; glTF export converts to Y-up. All sizes in game units.
import bpy, math

# ---------- clean scene ----------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
for block in (bpy.data.meshes, bpy.data.materials):
    for item in list(block):
        block.remove(item)

def mat(name, color, rough=0.85, metal=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    return m

BODY  = mat('BodyMat',  (0.30, 0.42, 0.65))   # tinted per skin/team at runtime
DARK  = mat('DarkMat',  (0.10, 0.13, 0.17))
GEAR  = mat('GearMat',  (0.16, 0.20, 0.25))
SKIN  = mat('SkinMat',  (0.87, 0.66, 0.50))
BOOT  = mat('BootMat',  (0.09, 0.10, 0.11))
VISOR = mat('VisorMat', (0.05, 0.30, 0.45), rough=0.25, metal=0.6)

def block(name, size, loc, material, bevel=0.018, taper=None, rot=None):
    """Cube scaled to size (x,y,z = game x,z,y ... careful: we build in Blender axes
    where Z is up; caller passes (sx, sz_depth, sy_height))."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (size[0] * 2, size[1] * 2, size[2] * 2)   # sizes are half-extents
    bpy.ops.object.transform_apply(scale=True)
    if taper:  # scale the top face in (tapered silhouette)
        me = ob.data
        top_z = max(v.co.z for v in me.vertices)
        for v in me.vertices:
            if abs(v.co.z - top_z) < 1e-4:
                v.co.x *= taper
                v.co.y *= taper
    if rot:
        ob.rotation_euler = rot
    b = ob.modifiers.new('bevel', 'BEVEL')
    b.width = bevel
    b.segments = 2
    b.limit_method = 'ANGLE'
    ob.data.materials.append(material)
    return ob

def parent_to(child, parent, parent_world=(0, 0, 0)):
    # glTF stores plain local TRS — convert world placement to parent-local
    # coords explicitly (matrix_world is stale mid-build; matrix_parent_inverse
    # does not survive export).
    world = child.location.copy()
    child.parent = parent
    child.location = (world[0] - parent_world[0], world[1] - parent_world[1], world[2] - parent_world[2])

root = bpy.data.objects.new('soldier', None)
bpy.context.collection.objects.link(root)

# ---------- torso (tapered), vest, belt ----------
torso = block('torso', (0.32, 0.19, 0.38), (0, 0, 1.12), BODY, taper=1.18)   # broader shoulders
vest  = block('vest',  (0.285, 0.225, 0.24), (0, 0, 1.14), GEAR)
pouch = block('pouch', (0.10, 0.05, 0.08), (0, -0.24, 1.02), DARK)
belt  = block('belt',  (0.33, 0.20, 0.05), (0, 0, 0.80), DARK)
for o in (torso, vest, pouch, belt):
    parent_to(o, root)

# ---------- head + helmet + visor ----------
head   = block('head',   (0.165, 0.155, 0.17), (0, 0, 1.62), SKIN)
helmet = block('helmet', (0.205, 0.195, 0.10), (0, 0, 1.795), GEAR, taper=0.72)
rim    = block('rim',    (0.215, 0.205, 0.030), (0, 0, 1.73), DARK)
visor  = block('visor',  (0.155, 0.012, 0.045), (0, -0.185, 1.65), VISOR, bevel=0.006)
for o in (head, helmet, rim, visor):
    parent_to(o, root)

# ---------- legs: pivot empties at the hip ----------
def leg(side, x):
    hip = bpy.data.objects.new('leg' + side, None)
    hip.location = (x, 0, 0.72)
    bpy.context.collection.objects.link(hip)
    parent_to(hip, root)
    thigh = block('thigh' + side, (0.105, 0.115, 0.20), (x, 0, 0.55), BODY)
    shin  = block('shin' + side,  (0.085, 0.095, 0.16), (x, 0, 0.22), GEAR)
    boot  = block('boot' + side,  (0.115, 0.175, 0.06), (x, -0.03, 0.055), BOOT)
    for o in (thigh, shin, boot):
        parent_to(o, hip, (x, 0, 0.72))
    return hip

leg('L', -0.17)
leg('R',  0.17)

# ---------- arms: pivot empties at the shoulder, reaching forward ----------
def arm(side, x):
    sh = bpy.data.objects.new('arm' + side, None)
    sh.location = (x, 0, 1.46)
    bpy.context.collection.objects.link(sh)
    parent_to(sh, root)
    pad   = block('pad' + side,   (0.115, 0.15, 0.085), (x, 0, 1.475), GEAR)
    upper = block('upper' + side, (0.075, 0.085, 0.16), (x, -0.05, 1.33), BODY, rot=(0.5, 0, 0))
    fore  = block('fore' + side,  (0.065, 0.15, 0.07),  (x * 0.82, -0.24, 1.20), BODY, rot=(0.15, 0, 0))
    hand  = block('hand' + side,  (0.06, 0.06, 0.06),   (x * 0.62, -0.34, 1.18), SKIN)
    for o in (pad, upper, fore, hand):
        parent_to(o, sh, (x, 0, 1.46))
    return sh

arm('L', -0.30)
arm('R',  0.30)

# ---------- gun mount marker (game attaches its per-class gun group here) ----------
gm = bpy.data.objects.new('gunMount', None)
gm.location = (0, -0.44, 1.2)
bpy.context.collection.objects.link(gm)
parent_to(gm, root)

# ---------- export ----------
import sys
out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'models/soldier.glb'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_yup=True)
print('EXPORTED', out)
