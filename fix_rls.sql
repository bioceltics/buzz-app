-- Enable RLS on spatial_ref_sys (PostGIS system table)
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (this is reference data)
CREATE POLICY "Allow read access to spatial_ref_sys" ON public.spatial_ref_sys
  FOR SELECT USING (true);
